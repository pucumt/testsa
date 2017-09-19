const Sequelize = require('sequelize');

const uuid = require('uuid');

const config = require('./settings');

console.log('init sequelize...');

function generateId() {
    return uuid.v1().replace(/-/g, "");
}

var sequelize = new Sequelize(config.db, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs._id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createdAt = {
        type: Sequelize.DATE,
        allowNull: false
    };
    attrs.updatedAt = {
        type: Sequelize.DATE,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };

    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj._id) {
                        obj._id = generateId();
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {
                    console.log('will update entity...');
                    obj.updatedAt = now;
                    obj.version++;
                }
            }
        }
    });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DECIMAL', 'DOUBLE', 'DATE', 'DATEONLY', 'BOOLEAN', 'NOW'];

var exp = {
    defineModel: defineModel,
    sync: () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            return sequelize.sync({
                force: true
            });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;