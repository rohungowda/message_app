// for new messages when user is not connected to rooms
//const Redis = require('ioredis');


class SubscriberManager{
    constructor(){
        this.subscriber_map = {}
    }

    create_subscriber(subscriber_id){
        const subscriber = new Redis()

        subscriber.on('message', (channel, message) =>{
            const {status, body} = message
            console.log(this.subscriber_map)
            console.log(`Recieved message ${message.status} to channel ${channel}`)

        })

        this.subscriber_map[subscriber_id] = subscriber
    }

    subscribe_subscriber(subscriber_id, room_id){

        this.subscriber_map[subscriber_id].subscribe(room_id)
    }

    unsubscribe_subscriber(subscriber_id, room_id=null){
        if (room_id){
            this.subscriber_map[subscriber_id].unsubscribe(room_id)
        }else{
            this.subscriber_map[subscriber_id].unsubscribe()
        }

    }

    delete_subscriber(subscriber_id){
        this.subscriber_map[subscriber_id].unsubscribe()
        this.subscriber_map[subscriber_id].quit()
        delete this.subscriber_map[subscriber_id]
    }

    async shutdown_subscribers(){
        for (const key in this.subscriber_map) {
            await this.subscriber_map[key].unsubscribe()
            await this.subscriber_map[key].quit()
          }
        this.subscriber_map = {}
    }

}


//exports.SubscriberManager = SubscriberManager
//exports.publisher = publisher