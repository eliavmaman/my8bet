export function getCID() {

    if (!sessionStorage.CID) {
        return 123;
    }

    return sessionStorage.CID;
}


export function getCIDOrDefault() {

    if (!sessionStorage.CID) {
        return 123;
    }

    return sessionStorage.CID;
}

export function saveUserToLocalStorage(user) {

    sessionStorage.setItem('8bet-user', JSON.stringify(user));
}

export function getUserFromLocalStorage() {

    return JSON.parse(sessionStorage.getItem('8bet-user'));
}

export function isUserSubscribeToLiveEvents() {
    let cid = getCIDOrDefault();
    let user = getUserFromLocalStorage(cid);

    return user ? user.settings.liveEvents : false;
}
