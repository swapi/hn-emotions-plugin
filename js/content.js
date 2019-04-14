const MAX_BATCH_SIZE = 10
const HN_EMOTIONS_URL = 'http://localhost:8080'

const trs = document.getElementsByClassName('athing comtr')

function createToggleSwitch(switchLabel, switchId, styleClass) {
    let div  = document.createElement('div')
    div.setAttribute('class', 'custom-switch')

    let input  = document.createElement('input')
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

    let label  = document.createElement('label')
    label.setAttribute('class', 'badge badge-pill ' + styleClass)
    label.setAttribute('style', 'word-wrap:break-word; font-size: 8px;')
    label.setAttribute('for', switchId)
    label.innerText = switchLabel

    let count  = document.createElement('label')
    count.id = "count_" + switchId
    count.setAttribute('class', 'badge badge-pill badge-light')
    count.innerText = "0"
    label.appendChild(createSpacer())
    label.appendChild(count)

    div.appendChild(label)

    return div
}

function createEmotionHeader() {
    let table  = document.createElement('table')
    table.setAttribute('align', 'center')
    let tr  = document.createElement('tr')

    let td1 = document.createElement('td')
    let emSwitch = createToggleSwitch('Empathetic', "empathetic", 'badge-primary')
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

function createAnchor(styleClass, icon, count, tooltip) {
    let a  = document.createElement('button');
    a.setAttribute('class', styleClass)
    a.setAttribute('style', 'color: #fff;')
    a.setAttribute('title', tooltip)
    a.innerText = icon + " " + count

    return a;
}

function createSpacer() {
    let div  = document.createElement('span');
    div.innerText = " "
    return div
}

function linkId() {
    let firstSplit = document.URL.split('&')[0]
    return firstSplit.split('=')[1]
}

function setEmotionOnPage(parent, a1, a2, a3, a4, a5, resp) {
    a1.innerText = '🤝 ' + resp[0]
    a2.innerText = '👏 ' + resp[1]
    a3.innerText = '💀 ' + resp[2]
    a4.innerText = '🔥 ' + resp[3]
    a5.innerText = '👊 ' + resp[4]

    let totalVotes = resp[0] + resp[1] + resp[2] + resp[3] + resp[4]
    let maxVotes = Math.max(resp[0], resp[1], resp[2], resp[3], resp[4])
    if(totalVotes > 5) {
        if(resp[0] == maxVotes) {
            parent.setAttribute('emotion', 'empathetic')
            return 0
        } else if(resp[1] == maxVotes) {
            parent.setAttribute('emotion', 'encouraging')
            return 1
        } else if(resp[2] == maxVotes) {
            parent.setAttribute('emotion', 'adhominem')
            return 2
        } else if(resp[3] == maxVotes) {
            parent.setAttribute('emotion', 'flame_war')
            return 3
        } else if(resp[4] == maxVotes) {
            parent.setAttribute('emotion', 'discouraging')
            return 4
        } 
    }

    return -1
}

function checkUserLoggedIn(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", HN_EMOTIONS_URL + "/user/valid", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == '200') {
            callback(JSON.parse(xhr.responseText))
        }
    }
    xhr.send();
}

function addVotesToTatal(emotion, delta) {
    if(delta > 0) {
        let em = document.getElementById('count_' + emotion)
        console.log(emotion + " = " + delta + ", em.innerText = " + em.innerText)
        em.innerText = "" + ((em.innerText | 0) + delta)
        console.log("After em.innerText = " + em.innerText)
    }
}

function getEmotions(parents, a1s, a2s, a3s, a4s, a5s) {
    let linkId_ = linkId()

    let xhr = new XMLHttpRequest();
    let commentIds = parents.map(function (t) { return t.id }).join(',')
    xhr.open("GET", HN_EMOTIONS_URL + "/emotions/" + linkId_ + "/" + commentIds, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == '200') {
            let resp = JSON.parse(xhr.responseText);

            let emotionCounts = [0, 0, 0, 0, 0]
            for(var i = 0; i < resp.length; i++) {
                let r = setEmotionOnPage(parents[i], a1s[i], a2s[i], a3s[i], a4s[i], a5s[i], resp[i])
                if(r > -1) {
                    emotionCounts[r] += 1
                }
            }

            addVotesToTatal('empathetic', emotionCounts[0])
            addVotesToTatal('encouraging', emotionCounts[1])
            addVotesToTatal('adhominem', emotionCounts[2])
            addVotesToTatal('flame_war', emotionCounts[3])
            addVotesToTatal('discouraging', emotionCounts[4])
        }
    }
    xhr.send();
}

function postEmotion(commentId, emotion) {
    let linkId_ = linkId()

    let xhr = new XMLHttpRequest();
    xhr.open("POST", HN_EMOTIONS_URL + "/emotions/" + linkId_ + "/" + commentId, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == '200') {
            let resp = JSON.parse(xhr.responseText);
            let a = document.getElementById(commentId + '_' + emotion)
            if(a) {
                switch(emotion) {
                    case 'empathetic': a.innerText = '🤝 ' + resp[0]; break
                    case 'encouraging': a.innerText = '👏 ' + resp[1]; break
                    case 'adhominem': a.innerText = '💀 ' + resp[2]; break
                    case 'flame_war': a.innerText = '🔥 ' + resp[3]; break
                    case 'discouraging': a.innerText = '👊 ' + resp[4]; break
                }
            }
            
            let parent = document.getElementById(commentId)
            let totalVotes = resp[0] + resp[1] + resp[2] + resp[3] + resp[4]
            let maxVotes = Math.max(resp[0], resp[1], resp[2], resp[3], resp[4])
            if(parent && (totalVotes > 5)) {
                let prevEmotion = parent.getAttribute('emotion')
                if(resp[0] == maxVotes && prevEmotion != 'empathetic') {
                    parent.setAttribute('emotion', 'empathetic')
                    let em = document.getElementById('empathetic')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(0, 123, 255, 0.2);')
                    }
                    addVotesToTatal('empathetic', 1)
                } else if(resp[1] == maxVotes && prevEmotion != 'encouraging') {
                    parent.setAttribute('emotion', 'encouraging')
                    let em = document.getElementById('encouraging')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(40, 167, 69, 0.2);')
                    }
                    addVotesToTatal('encouraging', 1)
                } else if(resp[2] == maxVotes && prevEmotion != 'adhominem') {
                    parent.setAttribute('emotion', 'adhominem')
                    let em = document.getElementById('adhominem')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(220, 53, 69, 0.2);')
                    }
                    addVotesToTatal('adhominem', 1)
                } else if(resp[3] == maxVotes && prevEmotion != 'flame_war') {
                    parent.setAttribute('emotion', 'flame_war')
                    let em = document.getElementById('flame_war')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(255, 193, 7, 0.2);')
                    }
                    addVotesToTatal('flame_war', 1)
                } else if(resp[4] == maxVotes && prevEmotion != 'discouraging') {
                    parent.setAttribute('emotion', 'discouraging')
                    let em = document.getElementById('discouraging')
                    if(em && em.checked) {
                        parent.setAttribute('style', 'background:rgba(108, 117, 125, 0.2);')
                    }
                    addVotesToTatal('discouraging', 1)
                } 
            }
        }
    }
    xhr.send('emotion=' + emotion)
}

(function() {
    var hnmain = document.getElementById('hnmain')
    var content = hnmain.children[0].children[2].children[0]

    var br = content.children[2]

    document.cookie['verification_token']
    var centerLink = document.createElement('center')
    var loginLink  = document.createElement('a')
    loginLink.setAttribute('align', 'center')
    checkUserLoggedIn(function(loggedIn) {
        if(loggedIn) {
            loginLink.target = "_blank"
            loginLink.href = HN_EMOTIONS_URL
            loginLink.innerText = "Emotions for HN"
        } else {
            loginLink.target = "_blank"
            loginLink.href = HN_EMOTIONS_URL + "/user/signup"
            loginLink.innerText = "Login to vote"
        }
    })
    centerLink.appendChild(loginLink)
    content.insertBefore(centerLink, br)

    var emotionHeader = createEmotionHeader()
    content.insertBefore(emotionHeader, br)

    var commentList = []
    var a1List = []
    var a2List = []
    var a3List = []
    var a4List = []
    var a5List = []
    for(var i = 0; i < trs.length; i++) {
        let tr = trs[i]
        let tmp = tr.children[0].children[0].children[0].children[0].children[2].children[0].children[0]
        
        let a1 = createAnchor('badge badge-pill badge-primary', '🤝', 0, 'Empathetic')
        a1.id = tr.id + "_empathetic"
        a1.addEventListener("click", function() { window.postMessage({ msg : 'vote', type: "empathetic", text: tr.id }, "*"); })
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

        commentList.push(tr)
        a1List.push(a1)
        a2List.push(a2)
        a3List.push(a3)
        a4List.push(a4)
        a5List.push(a5)

        if(((i+1) % MAX_BATCH_SIZE) == 0) {
            //process the batch
            getEmotions(commentList, a1List, a2List, a3List, a4List, a5List)

            commentList = []; a1List = []; a2List = []; a3List = []; a4List = []; a5List = []
        }
    }
    //process the last batch
    if(commentList.length > 0) {
        getEmotions(commentList, a1List, a2List, a3List, a4List, a5List)
    }
}())

window.addEventListener("message", function(event) {
    if (event.source != window)
        return;

    if (event.data.msg) {
        if(event.data.msg == 'vote') {
            postEmotion(event.data.text, event.data.type)
        } else if(event.data.msg == 'toggle') {
            if(event.data.text == 'checked') {
                highlightEmotion(event.data.type)
            } else {
                unhighlightEmotion(event.data.type)
            }
        }
    }
}, false);

function highlightEmotion(emotion) {
    for(var i = 0; i < trs.length; i++) {
        let tr = trs[i]

        let em = tr.getAttribute('emotion')
        if(em && em == emotion) {
            switch(emotion) {
                case 'empathetic': tr.setAttribute('style', 'background:rgba(0, 123, 255, 0.2);'); break
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