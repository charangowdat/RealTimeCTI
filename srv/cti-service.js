import cds from '@sap/cds'
import { INSERT } from '@sap/cds/lib/ql/cds-ql'

export default class CTIService extends cds.ApplicationService{

    async init() {
        const {CallEvents} = this.entities

        this.on('notifyEvent', async req => {
            const {
                callId,
                caller,
                callee,
                direction,
                event
            } = req.data

            //Basic Validations
            if (!callId){
                return req.reject(400, 'callId is required')
            }

            if (!event){
                return req.reject(400, 'event is required')
            }

            // Store the CTI event

            await INSERT.into(CallEvents).entries({
                callId,
                caller,
                callee,
                direction,
                event,
                timestamp: new Date()
            })

            return Ok
        })
        
        return super.unit()
    }
}