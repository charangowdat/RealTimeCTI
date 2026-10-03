using { cti } from '../db/schema';

@path: 'cti'
service CTIService {

    entity CallEvents as projection on cti.CallEvents;

    action notifyEvent(
        callId    : String(100),
        caller    : String(100),
        callee    : String(100),
        direction : String(20),
        event     : String(30)
    ) returns String;

}