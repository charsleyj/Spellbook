
function getJSONData() {

    // TEMP Change to allow for the webpage to be ran locally without a server
    spells = resource_spells;
    generateTable();

    // $.getJSON("resource/spells.json", function(data) {
    //     spells = data;
    //     generateTable();
    // });
}

function sl(n) {
    if(!n instanceof String) {
        n = n.toString();
    }
    return n.replaceAll(" ", "-").replaceAll("'", "").replaceAll("\\(", "").replaceAll("\\)", "").replaceAll("/", "");
}

function nameContains(name, search) {
    //return name.match("/" + search + "/i");
    return name.toLowerCase().includes(search.toLowerCase());
}


// Filter Functions

function hide(id) {
    $("#full-"+id).toggle();
    var e = $("#"+id);
    e.html(e.html()=="Show" ? "Hide" : "Show");
}

function noHide(element) {
    return true;
}

function isShown(element) {
    for (var filter in filters) {
        if (!filters[filter](element)) return false;
    }
    return true;
}

function setFilter(filter, func) {
    console.log(filter);
    filters[filter] = func;
    generateTable();
}

function setSort(s) {
    if (sort==s) reverse = !reverse;
    sort = s;
    generateTable();
}



// Spells Functions

function createSpellbook(spells, name = ""){
    let obj = {};
    obj.name = name;
    obj.spells = spells;
    return obj;
}

function addSpell(s) {
    var spellbook = getSpells();
    if (spellbook.spells.indexOf(s) >= 0)
        spellbook.spells.splice(spellbook.spells.indexOf(s), 1);
    else
        spellbook.spells.push(s);
    saveData(CURRENT_DATA, spellbook);
}

function hasSpell(s) {
    return hasData(CURRENT_DATA) && loadData(CURRENT_DATA).spells.indexOf(s) >= 0;
}

function getSpells() {
    return hasData(CURRENT_DATA) ? loadData(CURRENT_DATA) : createSpellbook([]);
}

function clearSpells() {
    if (confirm("Are you sure you want to clear the current spellbook?")) {
        saveData(CURRENT_DATA, createSpellbook([]));
        (view == "spells") ? generateTable() : generateSpellbooks();
    }
}

function saveSpellbook(name) {
    var spellbooks = getSpellbooks();
    var sb = getSpells();
    var contains = false;
    for (var i = 0; i<spellbooks.length; i++) {
        var s = spellbooks[i];
        if (s.name == name) {
            s.spells = sb.spells;
            contains = true;
        }
    }
    if (!contains) {
        spellbooks.push(createSpellbook(sb.spells, name));
    }
    saveData(SPELLBOOKS_DATA, spellbooks);
    generateSpellbooks();
}

function getSpellbooks() {
    return hasData(SPELLBOOKS_DATA) ? loadData(SPELLBOOKS_DATA) : [];
}

function deleteSpellbook(name) {
    if (!confirm("Are you sure you want to delete spellbook \""+name+"\"?"))
        return;

    var spellbooks = getSpellbooks();
    for (var i = 0; i<spellbooks.length; i++) {
        var sb = spellbooks[i];
        if (sb.name == name)
        	spellbooks.remove(i);
    }
    saveData(SPELLBOOKS_DATA, spellbooks);
    generateSpellbooks();
}

function saveCurrentBook() {
    var name = prompt("Choose a name for the spellbook.", "My Spellbook");
    if (name==null || name.length==0) return;
    saveSpellbook(name);
}

function loadSpellbook(name) {
    if (!confirm("Are you sure you want to load spellbook \""+name+"\"? This will clear the current spellbook.")) return;
    var spellbooks = getSpellbooks();
    for (var i = 0; i<spellbooks.length; i++) {
        if (spellbooks[i].name == name) {
            saveData(CURRENT_DATA, createSpellbook(spellbooks[i].spells));
            generateSpellbooks();
            return;
        }
    }
}

function saveToClipboard(){
    let spells = getSpells().spells.sort();
    let text = "";
    for(let s of spells){
        text += s + "\n";
    }
    navigator.clipboard.writeText(text);
}



// View Functions

function changeView(s) {
    if (view=="spells") {
        view = "spellbooks";
        $("#changeView"+s).html("View Spell List");
        $("#sorters").hide();
        generateSpellbooks();
    } else {
        view = "spells";
        $("#changeView"+s).html("View Spellbook Library");
        $("#sorters").show();
        generateTable();
    }
}

function generateSpellbooks() {
    var spellList = getSpells();
    var ans = "";
    var spellbooks = getSpellbooks();

    ans+="<div class='container'>";

    ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='saveCurrentBook();'>Save Spellbook As...</button> <button type='button' class='btn' onclick='clearSpells();'>Clear Spells</button> <button type='button' class='btn' onclick='saveToClipboard();'>Save to Clipboard</button> <h1 class='sb-name'>Current Spellbook</h1>";
    ans+=generateSpellNames(spellList.spells)+"</div>";

    for (var i = 0; i<spellbooks.length; i++) {
        var sb = spellbooks[i];
        ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='deleteSpellbook(\""+sb.name+"\");'>Delete Spellbook</button> <button type='button' class='btn' onclick='loadSpellbook(\""+sb.name+"\");'>Load Spellbook</button><h1 class='sb-name'>"+sb.name+"</h1>";
        ans+=generateSpellNames(sb.spells)+"</div>";
    }

    ans+="</div><div class='col-lg-2'></div>";

    $(".table").html(ans);
    $("#sort1").hide();
    $("#sort2").hide();
    $("#sort3").hide();
}

function generateSpellNames(spellbook) {
    if (spellbook.length==0)
        return "<div style='text-align: center; font-size: 1.2em; font-weight: bold; font-style: italic'>No spells!</div>";
    
    var ans = "<ul class='list-group' style='margin: auto; text-align: center; columns: 4; -webkit-columns: 4; -moz-columns: 4;'>";
    for (var i = 0; i<spellbook.length; i++) {
        var spellName = (spellbook[i] in spells) ? spells[spellbook[i]].name : spellbook[i];
        ans+="<li class='list-group-item' style='font-size: 1.2em; font-weight: bold; font-style: italic;'>"+spellName+"</li>";
    }
    ans+="</ul>";
    return ans;
}

function generateTable() {
    //sort based on sort variable and filter out those not allowed by isShown
    var sortable=[];
    for (var key in spells) if (spells.hasOwnProperty(key) && isShown(spells[key])) sortable.push([key, spells[key]]);
    sortable.sort(function(a, b) {
        return (reverse ? -1 : 1) * (a[1]["name"] < b[1]["name"] ? -1 : a[1]["name"] > b[1]["name"] ? 1 : 0); //if reverse is true, sort in the opposite direction.
    });
    sortable.sort(function(a, b) {
        return (reverse ? -1 : 1) * (a[1][sort] < b[1][sort] ? -1 : a[1][sort] > b[1][sort] ? 1 : 0); //if reverse is true, sort in the opposite direction.
    });

    console.log("Number of spells: " + sortable.length);

    var ans = "<table class='table'><thead class='thead-inverse'><tr><th>Full</th><th class='sort' onclick='setSort(\"name\");'>Name</th><th class='sort' onclick='setSort(\"level\");'>Level</th><th class='sort' onclick='setSort(\"school\");'>School</th><th class='sort' onclick='setSort(\"range\");'>Range</th><th class='sort' onclick='setSort(\"casting_time\");'>Casting Time</th><th class='sort' onclick='setSort(\"components\");'>Components</th><th>Spellbook</th></tr></thead>";

    for (var i = 0; i<sortable.length; i++)  {
        var arr = sortable[i];
        var name = arr[0];
        var spell = arr[1];
        var slug = arr[1].slug;

        if(sortsWithDividers.includes(sort) && (i == 0 || sortable[i][1][sort] != sortable[i-1][1][sort])) {
            ans += "<tr class='spell-divider'><td colspan='100%' class='row'>";
            ans += (sort == "level" && spell[sort] == 0) ? "Cantrip" : spell[sort];
            ans+="</td></tr>";
        }

        ans+="<tr class='spell-row" + (i % 2) + "'>";
        ans+="<td><button type='button' data-toggle='collapse' href='#full-"+slug+"' class='btn' onclick='hide(\""+slug+"\");' id=\""+slug+"\" >Show</button></td>";
        //ans+="<td><a href='#' data-activates='full-"+slug+"' class='button-collapse'>test</a></td>";
        ans+="<td data-toggle='tooltip' data-placement='right' title='"+(spell["description"].length>399 ? spell["description"].substr(0,400)+"..." : spell["description"])+"'>"+spell.name;
        if(spell["ritual"])
            ans+=" <em>(Ritual)</em>";
        if(spell["concentration"])
            ans+=" <em>(Conc.)</em>";
        ans+="</td>";
        ans+="<td>"+(spell["level"]==0 ? "Cantrip" : spell["level"])+"</td>";
        ans+="<td>"+spell["school"]+"</td>";
        ans+="<td>"+spell["range"]+("range_detail" in spell ? "*" : "")+"</td>";
        ans+="<td>"+spell["casting_time"]+"</td>";
        ans+="<td>"+spell["components"]+("components_isCostly" in spell ? "*" : "")+"</td>";
        ans+="<td style='text-align: center;'><button type='button' class='btn'  id='b-"+slug+"' onclick='var r = \"Remove\"; var a = \"Add\"; addSpell(\""+name+"\"); $(\"#b-"+slug+"\").html((hasSpell(\""+name+"\") ? r : a))'>"+(hasSpell(name) ? "Remove" : "Add")+"</button>";
        ans+="</tr>";

        ans+="<tr id=\"full-"+slug+"\" class='collapse spell-info' style='display:none;'><td colspan='100%' style='width:1em;' class='row'><blockquote><div class='col l8'>";

        ans+="<b>Classes: </b>"+spell["classes"].toString().replaceAll(",", ", ")+"<br/>";
        ans+="<b>Components: </b>"+spell["components"];
        if("components_detail" in spell)
            ans+=" <em>("+spell["components_detail"]+")</em>";
        ans+="<br/>";
        ans+="<b>Duration:</b> "+spell["duration"]+"<br/>";
        ans+="<b>Casting Time: </b>"+spell["casting_time"];
        if("casting_time_detail" in spell)
            ans+=", "+spell["casting_time_detail"];
        ans+="<br/>";
        ans+="<b>Range: </b>"+spell["range"];
        if("range_detail" in spell)
            ans+=" ("+spell["range_detail"]+")";
        ans+="<br/>";
        ans+="<b>Description:</b><br/>"+spell["description"]+"<br/>";
        if(spell["athigherlevel"].length >= 2)
            ans+="<b>At Higher Levels:</b><br/>"+spell["athigherlevel"]+"<br/>";
        
        ans+="<em style='font-size: .75em;'>Sources: ";
        for(let s=0; s<spell["sources"].length; ++s){
            ans+=spell["sources"][s]
            ans+=(spell["pages"][s] != "") ? " (pg. " + spell["pages"][s] + ")" : "";
            ans+=(s < spell["sources"].length-1) ? ", " : "";
        }
        ans+="</em><br/>";

        ans+="Links: <a href=\"http://dnd5e.wikidot.com/spell:" + spell["slug"] + "\" target=\"_blank\">WikiDot</a><br/>"

        ans+="</div></blockquote></td></tr>";
        $("#sort1").show();
        $("#sort2").show();
        $("#sort3").show();
    }

    ans+="</table>";
    $(".table").html(ans);
    $(".button-collapse")
}



// Stored Data Functions
// TEMP Changed from cookies to localStorage to allow the webpage to be ran locally without a server

function hasData(name){
    return localStorage.getItem(name) !== null;
    //return $.cookie(name) !== undefined;
}

function loadData(name) {
    return JSON.parse(localStorage.getItem(name));
    //return JSON.parse($.cookie(name));
}

function saveData(name, data){
    localStorage.setItem(name, JSON.stringify(data));
    //$.cookie(name, JSON.stringify(data), {expires: 2147483647, path: '/'});
}



// Main Function

const CURRENT_DATA = "spellbook";
const SPELLBOOKS_DATA = "spellbooks";

$('select').material_select();
$(".button-collapse").sideNav();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var spells = {};
var sort = "name";
var reverse = false;
var sortsWithDividers = ["level", "school", "casting_time"];

var filters = {
    "default": noHide
};

var view = "spells";

getJSONData();
