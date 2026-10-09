import http from 'node:http'

const PORT = 5000

let currentCall = {
    callId: 'CALL-00002',
    caller: '+919876543210',
    callee: '+918765432100',
    direction: 'INBOUND',
    state: 'IDLE'
}

function sendJson(res, statusCode, data) {

    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    })

    res.end(JSON.stringify(data))
}

function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = ''

        req.on('data', chunk => {
            body += chunk
        })

        req.on('end', () => {

            try {
                resolve(JSON.parse(body))
            } catch (error) {
                reject(error)
            }

        })

        req.on('error', reject)
    })
}

//send back the response like widget clicj Answer and phone get that command(Answer) so we are sending back Answered

async function sendCallEvent(event) {

    const response = await fetch(
        'http://localhost:4004/odata/v4/cti/notifyEvent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                callId: currentCall.callId,
                caller: currentCall.caller,
                callee: currentCall.callee,
                direction: currentCall.direction,
                event
            })
        }
    )

    const result = await response.json()

    console.log('📡 Event sent to CAP:', result)
}

const server = http.createServer(async (req, res) => {

    if (req.method === 'POST' && req.url === '/command') {

        try {

            const command = await readBody(req)

            console.log('📞 Command received:', command)

            if (!command.callId) {
                return sendJson(res, 400, {
                    error: 'callId is required'
                })
            }

            if (!command.command) {
                return sendJson(res, 400, {
                    error: 'command is required'
                })
            }

            if (command.callId !== currentCall.callId) {
                return sendJson(res, 404, {
                    error: 'Call not found'
                })
            }

            currentCall.state = command.command

            console.log('📱 Phone state:', currentCall.state)

            if (command.command === 'ANSWER') {
                await sendCallEvent('ANSWERED')
            }

            if (command.command === 'END') {
                await sendCallEvent('ENDED')
            }

            return sendJson(res, 200, {
                message: 'Command accepted',
                callId: currentCall.callId,
                state: currentCall.state
            })

        } catch (error) {

            return sendJson(res, 400, {
                error: 'Invalid JSON'
            })
        }
    }

    sendJson(res, 404, {
        error: 'Not found'
    })
})

server.listen(PORT, () => {

    console.log(`📱 Phone Simulator listening on http://localhost:${PORT}`)
    console.log(`📞 Current call: ${currentCall.callId}`)
    console.log(`📌 State: ${currentCall.state}`)

})