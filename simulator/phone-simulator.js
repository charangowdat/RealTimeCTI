const BASE_URL = 'http://localhost:4004/odata/v4/cti'

const call = {
    callId: 'CALL-00002',
    caller: '+919876543210',
    callee: '+918765432100',
    direction: 'INBOUND'
}

async function sendEvent(event) {

    const response = await fetch(`${BASE_URL}/notifyEvent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...call,
            event
        })
    })

    const data = await response.text()

    console.log(`📞 ${event}`)
    console.log(`   Status: ${response.status}`)
    console.log(`   Response: ${data}`)
    console.log('')
}

async function runCall() {

    console.log('🚀 Starting simulated call...')
    console.log('')

    await sendEvent('INCOMING')

    await new Promise(resolve => setTimeout(resolve, 2000))

    await sendEvent('ANSWERED')

    await new Promise(resolve => setTimeout(resolve, 3000))

    await sendEvent('ENDED')

    console.log('☎️ Call completed')
}

runCall()