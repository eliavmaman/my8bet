export function getCID() {

    for (var i = 0; i < localStorage.length; i++){

        var key = JSON.parse(localStorage.getItem(localStorage.key(i)));

        if(typeof key.named_user_id !==  "undefined" )
              return  key.named_user_id;

    }
    return null;
}



export function getCIDOrDefault() {

    for (var i = 0; i < localStorage.length; i++){

        var key = JSON.parse(localStorage.getItem(localStorage.key(i)));

        if(typeof key.named_user_id !==  "undefined" )
            return  key.named_user_id;

    }
    return 123;
}