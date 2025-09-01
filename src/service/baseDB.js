
import Dexie from 'dexie';
import dayjs from 'dayjs'
const db = new Dexie('baseDB');
db.version(1).stores({
    material: '&[name+type], createTime, updateTime, performance'

});

function savePerformance(msg) {
    return new Promise((resolve, reject) => {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        db.material.add({ ...msg, createTime: now, updateTime: now }).then((res) => {
            console.log("🚀 ~ savePerformance ~ res:", res);
            resolve(res[0] || {});
        }).catch((err) => {
            console.log("🚀 ~ savePerformance ~ err:", err);
            const { inner } = err
            reject({
                code: inner.code,
                message: inner.message,
            });
        })
    })
}

async function getPerformance(name, type) {
    return await db.material.where('[name+type]').equals([name, type]).toArray();
}

function updatePerformance(name, type, performance) {
    console.log("🚀 ~ updatePerformance ~ performance:", performance)
    return db.material.where('[name+type]').equals([name, type]).modify({ performance, updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') });
}

function deleteMaterial(name, type) {
    return db.material.where('[name+type]').equals([name, type]).delete();
}

function getAllMaterial() {
    return db.material.orderBy('name').toArray();
}


export { savePerformance, getPerformance, getAllMaterial, deleteMaterial, updatePerformance };
