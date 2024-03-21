export class Util {
    static pick(o, ...fields) {
        return fields.reduce((a, x) => {
            if(o.hasOwnProperty(x)) a[x] = o[x]
            return a
        }, {})
    }

    static pickRandomPos(){
        const arr = ['Perpendicular parking', 'Angle parking', 'Double parking']
        return arr[Math.floor(Math.random() * arr.length)]
    }

    static partialStringify(obj, ...fields) {
        const selected = {};
        for (const field of fields) {
            if (field in obj) {
                selected[field] = JSON.stringify(obj[field])
            }
        }
        return Object.assign({}, obj, selected)
    }

    static partialParse(obj, ...fields) {
        const selected = {};
        for (const field of fields) {
            if (field in obj) {
                selected[field] = JSON.parse(obj[field])
            }
        }
        return Object.assign({}, obj, selected)
    }

    static isValidPhoneNumber(phoneNumber) {
        // Check that the phone number is in E.164 format
        return /^[\+][1-9][0-9]{1,14}$/.test(phoneNumber);
    }

    static isValidWhatsAppNumber(phoneNumber) {
        // Check that the phone number is in E.164 format
        return /^whatsapp:[\+][1-9][0-9]{1,14}$/.test(phoneNumber);
    }

    // for the endCursor of graphql
    static convertNodeIdToCursor(node) {
        const nodeIdAsString = node.id.toString()
        return Buffer.from(nodeIdAsString, 'binary').toString('base64')
    }

    static convertCursorToNodeId(cursor) {
        return Buffer.from(cursor, 'base64').toString('binary')
    }

    static isValidEmailFormat(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
}
