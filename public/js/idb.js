// set up variable for idb connection
let idb;

// connect to idb, name db budget_tracker, start at version 1
const request = indexedDB.open('budget_tracker', 1);

// check for db version changes
request.onupgradedneeded = function(event) {
    // save a reference to the db
    const idb = event.target.result;

    // create new table and give autoincrement pk
    idb.createObjectStore('new_tx', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // if db created or connected, save reference in global vars
    idb = event.target.result;

    // check if app is online - if yes, upload local db
    if (navigator.online) {
        // actually call upload
        uploadTx();
    }
};

request.onerror = function (event) {
    // log error to console
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // ready a transaction to idb
    const tx = idb.transaction(['new_tx'], "readwrite");

    // access objectstore
    const budgetOS = tx.objectStore('new_tx');

    // add record
    budgetOS.add(record);
}

function uploadTx() {
    // ready a transaction to idb
    const tx = idb.transaction(['new_tx'], "readwrite");

    // access objectstore
    const budgetOS = tx.objectStore('new_tx');

    // get all records from idb
    const getAll = budgetOS.getAll();

    // promise to send records to server
    getAll.onsuccess = function () {
        if (getAll.results.length > 0) {
            fetch(`/api/transaction/bulk`, {
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
                    const tx = idb.transaction(['new_tx'], "readwrite"); 
                    const budgetOS = tx.objectStore('new_tx');
                    store.clear();
                });
        }
    };
}

// check to see if app is online
window.addEventListener('online', uploadTx);