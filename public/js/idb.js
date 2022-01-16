// set up variable for db connection
let db;

// connect to db, name db budget_tracker, start at version 1
const request = indexedDB.open('budget_tracker', 3);

// check for db version changes
request.onupgradedneeded = function(event) {
    // save a reference to the db
    const db = event.target.result;
    console.log('upgrade needed called');

    // create new table and give autoincrement pk
    db.createObjectStore("new_transaction");
//    db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function(event) {
    // if db created or connected, save reference in global vars
    db = event.target.result;

    // check if app is online - if yes, upload local db
    if (navigator.onLine) {
        // actually call upload
        uploadEntry();
    }
};

request.onerror = function (event) {
    // log error to console
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // ready a transaction to db
    const transaction = db.transaction(["new_transaction"], "readwrite").objectStore('new_transaction');

    // access objectstore
    const entryObjectStore = transaction.objectStore("new_transaction");

    // add record
    entryObjectStore.add(record);
}

function uploadEntry() {
    // ready a transaction to db
    const transaction = db.transaction(["new_transaction"], "readwrite").objectStore('new_transaction');

    // access objectstore
    const entryObjectStore = transaction.objectStore("new_transaction");

    // get all records from db
    const getAll = entryObjectStore.getAll();

    // promise to send records to server
    getAll.onsuccess = function () {
        if (getAll.results.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    "Content-Type": "application/json"
                },
            })
                .then((response) => response.json())
                .then((serverResponse) => {
                    if(serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const trans = db.transaction(["new_transaction"], "readwrite").objectStore('new_transaction'); 
                    const budgetObjStore = trans.objectstore("new_transaction");
                    store.clear();
                });
        }
    };
}

// check to see if app is online
window.addEventListener('online', uploadEntry);