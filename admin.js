// universal constants.
const MAINTITLE = "Tulajdonosok adatai";
const SOURCE_URL = "http://localhost:3000/";
const HEADER_JSON = "template";
const CONTENT_JSON = "owners";
const TABLE_ID = "dataTable";
const WEEKDAYS = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

// defining all CRUD options as constants.
const CREATE = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
        'Content-Type': 'application/json'
    },
    body: null // will be filled later with this: JSON.stringify(data)
};

const READ = {
    method: "GET",
    mode: "cors",
    cache: "no-cache"
};

const UPDATE = {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    headers: {
        'Content-Type': 'application/json'
    },
    body: null // will be filled later with this: JSON.stringify(data)
};

const DELETE = {
    method: "DELETE",
    mode: "cors",
    cache: "no-cache"
};

// any CRUD fetch to JSON-server.
function communicateServer(jsonPart, method) {
    return fetch(SOURCE_URL + jsonPart, method).then(
        data => data.json(),
        error => alert("Az adatbázis nem található !")
    );
}

// create a HTML element with setting attributes.
function createHtmlElement(tag, attributes) {
    let element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

function getTimeStamp() {
    let date = new Date();
    return date.toLocaleDateString() + " - " + WEEKDAYS[date.getDay()] + " - " + date.toLocaleTimeString();
}

function createSelect(headOrder, numberOfHeaders, i) {
    let select = createHtmlElement("select", { onchange: "changeOrder(this)" });
    for (let n = 0; n < numberOfHeaders - 2; n++) {
        for (let key in headOrder) {
            if (headOrder[key] == n) {
                let option = createHtmlElement("option");
                option.value = `${key}`;
                option.innerHTML = key;
                option.selected = (i == headOrder[key]) ? true : false;
                select.appendChild(option);
            }
        }
    }
    return select;
}

function makeTableHeader(tableHeaderJson) {
    document.querySelector("#mainTitle").innerHTML = MAINTITLE;
    document.querySelector("#timeStamp").innerHTML = "Adatok frissítve: " + getTimeStamp();
    let headOrder = tableHeaderJson[0];
    delete headOrder.id;
    let numberOfHeaders = Object.keys(headOrder).length;
    let tr = createHtmlElement("tr");

    for (let i = 0; i < numberOfHeaders; i++) {
        for (let key in headOrder) {
            if (headOrder[key] == i) {
                let th = createHtmlElement("th");
                if (i < numberOfHeaders - 2) {
                    let select = createSelect(headOrder, numberOfHeaders, i);
                    th.appendChild(select);
                } else {
                    th.innerHTML = key;
                }
                th.headers = key;
                tr.appendChild(th);
            }
        }
    }
    let tHead = document.querySelector("#" + TABLE_ID + " thead");
    tHead.innerHTML = "";
    tHead.appendChild(tr);
    setAdditionalButtons();
}

function makeTableContent(tableContentJson) {
    let tBody = document.querySelector("#" + TABLE_ID + " tbody");
    tBody.innerHTML = "";
    let th = document.querySelectorAll("#" + TABLE_ID + " thead tr th");

    for (let row of tableContentJson) {
        let tr = createHtmlElement("tr");

        for (let i = 0; i < Object.keys(th).length - 2; i++) {
            let td = createHtmlElement("td");
            let header = (th[i].headers == "id#") ? "id" : th[i].headers;
            if (header != "id") {
                td.onclick = function () { makeInput(this) };
            }
            td.innerHTML = row[header];
            td.headers = header;
            tr.appendChild(td);
        }
        tr.appendChild(createActionButtons());
        tr.appendChild(createCheckbox());
        tBody.appendChild(tr);
    }
}

function setAdditionalButtons() {
    let button = document.querySelectorAll(".AdditionalButton-1");
    for (let i = 0; i < button.length; i++) {
        button[i].setAttribute("class", "btn btn-primary btn-sm");
        button[i].title = "új adatsor létrehozása";
        button[i].onclick = function () { newRow() };
        button[i].innerHTML = '<i class="fa fa-plus-square" aria-hidden="true"></i>';
    }
    button = document.querySelectorAll(".AdditionalButton-2");
    for (let i = 0; i < button.length; i++) {
        button[i].setAttribute("class", "btn btn-success btn-sm");
        button[i].title = "kézi frissítés";
        button[i].onclick = function () { getStart() };
        button[i].innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>';
    }
}

function createActionButtons() {
    let td = createHtmlElement("td");
    let div = createHtmlElement("div", { class: "btn-group" });
    let firstButton = createHtmlElement("button",
        { class: "btn btn-primary btn-sm", title: "módosítás", onclick: "modifyRow(this)" });
    firstButton.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>';
    let secondButton = createHtmlElement("button",
        { class: "btn btn-danger btn-sm", title: "törlés", onclick: "deleteRow(this)" });
    secondButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
    let thirdButton = createHtmlElement("button",
        { class: "btn btn-success btn-sm", title: "másolás", onclick: "copyRow(this)" });
    thirdButton.innerHTML = '<i class="fa fa-clone" aria-hidden="true"></i>';
    div.appendChild(firstButton);
    div.appendChild(secondButton);
    div.appendChild(thirdButton);
    td.appendChild(div);
    return td;
}

function createCheckbox() {
    let td = createHtmlElement("td");
    let checkBox = createHtmlElement("input",
        { type: "checkbox", name: "checkGroup", state: "unchecked", title: "csoportba foglalás" });
    td.appendChild(checkBox);
    return td;
}

function changeOrder(element) {
    let allHead = element.parentElement.parentElement.parentElement.querySelectorAll("th");
    let data = {}

    for (let i = 0; i < allHead.length; i++) {
        data[allHead[i].headers] = i;
    }
    let newSelectedKey = element.value;
    let currentKey = element.parentElement.headers;
    let tempValue = data[newSelectedKey];
    data[newSelectedKey] = data[currentKey];
    data[currentKey] = tempValue;
    let jsonId = "1";

    // body fill.
    UPDATE.body = JSON.stringify(data);
    communicateServer(HEADER_JSON + "/" + jsonId, UPDATE).then(backdata => getStart());
}

function makeInput(element) {
    if (firstClick) { temp = element; firstClick = false; }

    if (element != temp) {
        temp.innerHTML = temp.firstChild.value;
        temp.onclick = function () { makeInput(this) };
    }
    temp = element;
    let input = createHtmlElement("input", {
        type: "text", name: "name", value: `${element.innerHTML}`,
        size: "auto", padding: "0px", margin: "0px"
    });
    element.onclick = "";
    element.innerHTML = "";
    element.appendChild(input);
}

function getJsonIdFrom(element) {
    let td = element.parentElement.parentElement.parentElement.querySelectorAll("td");

    for (let i = 0; i < Object.keys(td).length - 2; i++) {
        if (td[i].headers == "id") {
            return td[i].innerHTML;
        }
    }
}

function prepareData(element) {
    let td = element.parentElement.parentElement.parentElement.querySelectorAll("td");
    let data = {};

    for (let i = 0; i < Object.keys(td).length - 2; i++) {
        let header = td[i].headers;
        if (td[i].childElementCount) {
            td[i].innerHTML = td[i].firstChild.value;
        }
        data[header] = td[i].innerHTML;
    }
    delete data.id;
    return data;
}

function modifyRow(element) {
    if (!confirm("Biztosan MÓDOSÍTANI akarja az adatokat?")) { return }
    let data = prepareData(element);
    let jsonId = getJsonIdFrom(element);

    // body fill.
    UPDATE.body = JSON.stringify(data);
    communicateServer(CONTENT_JSON + "/" + jsonId, UPDATE).then(backdata => getStart());
}

function deleteRow(element) {
    if (!confirm("Biztosan TÖRÖLNI akarja az adatsort?")) { return }
    let jsonId = getJsonIdFrom(element);
    communicateServer(CONTENT_JSON + "/" + jsonId, DELETE).then(backdata => getStart());
}

function copyRow(element) {
    // if (!confirm("Biztosan MÁSOLNI akarja a kiválasztott adatsort?")) { return }
    let data = prepareData(element);

    // body fill.
    CREATE.body = JSON.stringify(data);
    communicateServer(CONTENT_JSON, CREATE).then(backdata => getStart());
}

function newRow() {
    let th = document.querySelectorAll("#" + TABLE_ID + " thead tr th");
    let data = {};

    for (let i = 0; i < Object.keys(th).length - 2; i++) {
        let header = th[i].headers;
        data[header] = "---";
    }
    delete data.id;

    // body fill.
    CREATE.body = JSON.stringify(data);
    communicateServer(CONTENT_JSON, CREATE).then(backdata => getStart());
}

function getStart() {
    communicateServer(HEADER_JSON, READ).then(data => makeTableHeader(data)).then(backdata =>
        communicateServer(CONTENT_JSON, READ).then(data => makeTableContent(data)));
}

// START.
let temp = {};
let firstClick = true;
getStart();