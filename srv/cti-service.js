import cds from '@sap/cds'
const { INSERT } = cds.ql

export default class CTIService extends cds.ApplicationService {
    async init() {
        const { CallEvents } = this.entities

        this.on('notifyEvent', async req => {
            const { callId, caller, callee, direction, event } = req.data

            if (!callId) {
                return req.reject(400, 'callId is required')
            }

            if (!event) {
                return req.reject(400, 'event is required')
            }

            await INSERT.into(CallEvents).entries({
                callId,
                caller,
                callee,
                direction,
                event,
                timestamp: new Date()
            })

            return 'Event received'
        })

        return super.init()
    }
}
