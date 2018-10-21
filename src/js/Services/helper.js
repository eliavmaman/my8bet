export function getCID() {
    localStorage.clear();
    //localStorage.setItem("test", JSON.stringify("fddf"));
    //localStorage.setItem("words", JSON.stringify({"channel_id":"cc846ef7-887c-4564-962a-619598260317","opt_in":true,"named_user_id":"703107178"}));

    for (var i = 0; i < localStorage.length; i++){
        let key = JSON.parse(localStorage.getItem(localStorage.key(i)));
        if( typeof key.named_user_id !==  "undefined" )
           return  key.named_user_id;

    }
    return null;
}