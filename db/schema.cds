namespace cti;

entity CallEvents {
    key ID          : UUID;
        callId      : String(100);
        caller      : String(100);
        callee      : String(100);
        direction   : String(20);
        event       : String(30);
        timestamp   : Timestamp;
}