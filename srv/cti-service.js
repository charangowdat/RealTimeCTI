import cds from '@sap/cds'

const { INSERT } = cds.ql

export default class CTIService extends cds.ApplicationService {

    async init() {

        const { CallEvents } = this.entities

        this.on('notifyEvent', async req => {

            const {
                callId,
                caller,
                callee,
                direction,
                event
            } = req.data

            if (!callId) {
                return req.reject(400, 'callId is required')
            }

            if (!event) {
                return req.reject(400, 'event is required')
            }

            const eventData = {
                callId,
                caller,
                callee,
                direction,
                event
            }

            // 1. Persist event
            await INSERT.into(CallEvents).entries({
                ...eventData,
                timestamp: new Date()
            })

            // 2. Publish to WebSocket service
            const wsService = cds.services.CTIWebsocket

            await wsService.emit('callEvent', eventData)

            return 'Event received'
        })

        return super.init()
    }
}