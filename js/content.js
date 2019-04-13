const HN_EMOTIONS_URL = 'http://localhost:8080'

const trs = document.getElementsByClassName('athing comtr')

function fa_icon(icon) {
    var i  = document.createElement('i');
    i.className = icon;
    return i;
}

function createAnchor(styleClass, icon, count, tooltip) {
    var a  = document.createElement('button');
    a.setAttribute('class', styleClass)
    a.setAttribute('style', 'color: #fff;')
    a.setAttribute('title', tooltip)
    a.innerText = icon + " " + count

    return a;
}

function createSpacer() {
    var div  = document.createElement('span');
    div.innerText = " "
    return div
}

window.addEventListener("message", function(event) {
    if (event.source != window)
        return;

    if (event.data.msg) {
        if(event.data.msg == 'vote') {
            console.log(event.data.text + " = " + event.data.type)
            postEmotion(event.data.text, event.data.type)
        } else if(event.data.msg == 'toggle') {
            console.log(event.data.text + " = " + event.data.type)
            if(event.data.text == 'checked') {
                highlightEmotion(event.data.type)
            } else {
                unhighlightEmotion(event.data.type)
            }
        }
    }
}, false);

function linkId() {
    var firstSplit = document.URL.split('&')[0]
    return firstSplit.split('=')[1]
}

function highlightEmotion(emotion) {
    for(var i = 0; i < trs.length; i++) {
        let tr = trs[i]

        let em = tr.getAttribute('emotion')
        if(em && em == emotion) {
            switch(emotion) {
                case 'empathatic': tr.setAttribute('style', 'background:rgba(0, 123, 255, 0.2);'); break
                case 'encouraging': tr.setAttribute('style', 'background:rgba(40, 167, 69, 0.2);'); break
                case 'adhominem': tr.setAttribute('style', 'background:rgba(220, 53, 69, 0.2);'); break
                case 'flame_war': tr.setAttribute('style', 'background:rgba(255, 193, 7, 0.2);'); break
                case 'discouraging': tr.setAttribute('style', 'background:rgba(108, 117, 125, 0.2);'); break
            }
        }
    }
}

function unhighlightEmotion(emotion) {
    for(var i = 0; i < trs.length; i++) {
        let tr = trs[i]

        let em = tr.getAttribute('emotion')
        if(em && em == emotion) {
            tr.setAttribute('style', '')
        }
    }
}

function getEmotions(commentId, parent, a1, a2, a3, a4, a5) {
    var linkId_ = linkId()

    var xhr = new XMLHttpRequest();
    xhr.open("GET", HN_EMOTIONS_URL + "/emotions/" + linkId_ + "/" + commentId, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == '200') {
            let resp = JSON.parse(xhr.responseText);
            console.log(linkId_ + ":" + commentId + " = " + resp)
            
            a1.innerText = '🤝 ' + resp[0]
            a2.innerText = '👏 ' + resp[1]
            a3.innerText = '💀 ' + resp[2]
            a4.innerText = '🔥 ' + resp[3]
            a5.innerText = '👊 ' + resp[4]

            let totalVotes = resp[0] + resp[1] + resp[2] + resp[3] + resp[4]
            let maxVotes = Math.max(resp[0], resp[1], resp[2], resp[3], resp[4])
            if(totalVotes >= 5) {
                if(resp[0] == maxVotes) {
                    parent.setAttribute('emotion', 'empathatic')
                } else if(resp[1] == maxVotes) {
                    parent.setAttribute('emotion', 'encouraging')
                } else if(resp[2] == maxVotes) {
                    parent.setAttribute('emotion', 'adhominem')
                } else if(resp[3] == maxVotes) {
                    parent.setAttribute('emotion', 'flame_war')
                } else if(resp[4] == maxVotes) {
                    parent.setAttribute('emotion', 'discouraging')
                } 
            }
        }
    }
    xhr.send();
}

function postEmotion(commentId, emotion) {
    var linkId_ = linkId()

    var xhr = new XMLHttpRequest();
    xhr.open("POST", HN_EMOTIONS_URL + "/emotions/" + linkId_ + "/" + commentId, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == '200') {
            let resp = JSON.parse(xhr.responseText);
            let a = document.getElementById(commentId + '_' + emotion)
            if(a) {
                switch(emotion) {
                    case 'empathatic': a.innerText = '🤝 ' + resp[0]; break
                    case 'encouraging': a.innerText = '👏 ' + resp[1]; break
                    case 'adhominem': a.innerText = '💀 ' + resp[2]; break
                    case 'flame_war': a.innerText = '🔥 ' + resp[3]; break
                    case 'discouraging': a.innerText = '👊 ' + resp[4]; break
                }
            }
            
            let parent = document.getElementById(commentId)
            let totalVotes = resp[0] + resp[1] + resp[2] + resp[3] + resp[4]
            let maxVotes = Math.max(resp[0], resp[1], resp[2], resp[3], resp[4])
            console.log("maxVotes = " + maxVotes)
            console.log("resp = " + resp)
            if(parent && (totalVotes >= 5)) {
                if(resp[0] == maxVotes) {
                    parent.setAttribute('emotion', 'empathatic')
                    let em = document.getElementById('empathatic')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(0, 123, 255, 0.2);')
                    }
                } else if(resp[1] == maxVotes) {
                    parent.setAttribute('emotion', 'encouraging')
                    let em = document.getElementById('encouraging')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(40, 167, 69, 0.2);')
                    }
                } else if(resp[2] == maxVotes) {
                    parent.setAttribute('emotion', 'adhominem')
                    let em = document.getElementById('adhominem')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(220, 53, 69, 0.2);')
                    }
                } else if(resp[3] == maxVotes) {
                    parent.setAttribute('emotion', 'flame_war')
                    let em = document.getElementById('flame_war')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(255, 193, 7, 0.2);')
                    }
                } else if(resp[4] == maxVotes) {
                    parent.setAttribute('emotion', 'discouraging')
                    let em = document.getElementById('discouraging')
                    console.log('discouraging.checked = ' + em.checked)
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(108, 117, 125, 0.2);')
                    }
                } 
            }
        }
    }
    xhr.send('emotion=' + emotion)
}

function createToggleSwitch(switchLabel, switchId, styleClass) {
    var div  = document.createElement('div')
    div.setAttribute('class', 'custom-switch')

    var input  = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.id = switchId
    input.addEventListener("change", function() {
        if(this.checked) {
            window.postMessage({ msg : 'toggle', type: switchId, text : 'checked' }, "*"); 
        } else {
            window.postMessage({ msg : 'toggle', type: switchId, text : 'unchecked' }, "*"); 
        }
    })
    div.appendChild(input)
    
    var label  = document.createElement('label')
    label.setAttribute('class', 'badge badge-pill ' + styleClass)
    label.setAttribute('style', 'word-wrap:break-word;')
    label.setAttribute('for', switchId)
    label.innerText = switchLabel
    div.appendChild(label)

    return div
}

function createEmotionHeader() {
    let table  = document.createElement('table')
    let tr  = document.createElement('tr')

    let td1 = document.createElement('td')
    let emSwitch = createToggleSwitch('Empathatic', "empathatic", 'badge-primary')
    td1.appendChild(emSwitch)
    tr.appendChild(td1)

    let td2 = document.createElement('td')
    let enSwitch = createToggleSwitch('Encouraging', "encouraging", 'badge-success')
    td2.appendChild(enSwitch)
    tr.appendChild(td2)

    let td3 = document.createElement('td')
    let adSwitch = createToggleSwitch('Ad hominem', "adhominem", 'badge-danger')
    td3.appendChild(adSwitch)
    tr.appendChild(td3)

    let td4 = document.createElement('td')
    let fwSwitch = createToggleSwitch('Flame war', "flame_war", 'badge-warning')
    td4.appendChild(fwSwitch)
    tr.appendChild(td4)

    let td5 = document.createElement('td')
    let dcSwitch = createToggleSwitch('Discouraging', "discouraging", 'badge-secondary')
    td5.appendChild(dcSwitch)
    tr.appendChild(td5)

    table.appendChild(tr)

    return table
}

(function() {
    let hnmain = document.getElementById('hnmain')
    let content = hnmain.children[0].children[2].children[0]

    let br = content.children[2]
    let emotionHeader = createEmotionHeader()
    content.insertBefore(emotionHeader, br)

    for(var i = 0; i < trs.length; i++) {
        let tr = trs[i]
        let tmp = tr.children[0].children[0].children[0].children[0].children[2].children[0].children[0]
        
        let a1 = createAnchor('badge badge-pill badge-primary', '🤝', 0, 'Empathetic')
        a1.id = tr.id + "_empathatic"
        a1.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "empathatic", text: tr.id }, "*"); })
        tmp.appendChild(a1)
        tmp.appendChild(createSpacer())

        let a2 = createAnchor('badge badge-pill badge-success', '👏', 0, 'Encouraging')
        a2.id = tr.id + "_encouraging"
        a2.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "encouraging", text: tr.id }, "*"); })
        tmp.appendChild(a2)
        tmp.appendChild(createSpacer())

        let a3 = createAnchor('badge badge-pill badge-danger', '💀', 0, 'Ad hominem')
        a3.id = tr.id + "_adhominem"
        a3.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "adhominem", text: tr.id }, "*"); })
        tmp.appendChild(a3)
        tmp.appendChild(createSpacer())

        let a4 = createAnchor('badge badge-pill badge-warning', '🔥', 0, 'Flame war')
        a4.id = tr.id + "_flame_war"
        a4.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "flame_war", text: tr.id }, "*"); })
        tmp.appendChild(a4)
        tmp.appendChild(createSpacer())

        let a5 = createAnchor('badge badge-pill badge-secondary', '👊', 0, 'Discouraging')
        a5.id = tr.id + "_discouraging"
        a5.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "discouraging", text: tr.id }, "*"); })
        tmp.appendChild(a5)

        getEmotions(tr.id, tr, a1, a2, a3, a4, a5)
    }
}())