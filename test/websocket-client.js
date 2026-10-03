const socket = new WebSocket('ws://localhost:4004/ws/cti')

socket.addEventListener('open', () => {
    console.log('✅ WebSocket connected')
})

socket.addEventListener('message', message => {
    console.log('📨 WebSocket message received:')
    console.log(message.data)
})

socket.addEventListener('close', () => {
    console.log('❌ WebSocket connection closed')
})

socket.addEventListener('error', error => {
    console.error('⚠️ WebSocket error:', error)
})