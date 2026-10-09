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

        // send Command (reverse)
            this.on('sendCommand', async req => {
                const { callId, command } = req.data

            if (!callId) {
                return req.reject(400, 'callId is required')
            }

            if (!command) {
                return req.reject(400, 'command is required')
            }

            console.log('📞 CTI command received:', {
                callId,
                command
            })

            try {
                const response = await fetch('http://localhost:5000/command', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        callId,
                        command
                    })
                })

                const result = await response.json()

                if (!response.ok) {
                    return req.reject(
                        response.status,
                        result.message || 'Phone simulator rejected command'
                    )
                }

                console.log('📱 Phone simulator response:', result)

                return 'Command sent to phone simulator'
            } catch (error) {
                console.error('❌ Failed to contact phone simulator:', error)

                return req.reject(
                    500,
                    'Phone simulator is unavailable'
                )
            }
        })

        return super.init()
    }
}