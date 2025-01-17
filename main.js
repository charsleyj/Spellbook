
function getJSONData() {

    // TEMP Change to allow for the webpage to be ran locally without a server
    spells = resource_spells;
    checkQueryString();
    generateTable();

    // $.getJSON("resource/spells.json", function(data) {
    //     spells = data;
    //     generateTable();
    // });
}

function checkQueryString(){
    var queryStrings = new URLSearchParams(window.location.search);
    if(!queryStrings.has("s"))
        return;

    var queriedIDs = queryStrings.get("s").split(',');
    var queriedSpells = [];
    for(let s of Object.keys(spells)){
        if(queriedIDs.includes(spells[s].id))
            queriedSpells.push(s);
    }
    
    var currentSpells = getSpells().spells;
    var force = (currentSpells.length == 0) || haveSameSpells(queriedSpells, currentSpells);
    
    if(force || confirm("Do you want to replace your current spells?")){

        clearSpells(true);
        for(let s of queriedSpells){
            addSpell(s);
        }
        setSort("level");
        $("#added").val("1").change();
        $("select").material_select();

        if(queriedSpells.length != queriedIDs.length)
            alert("Only " + queriedSpells.length + " out of " + queriedIDs.length + " spells were added. There may be duplicates or unknown spell IDs.");
    }
}

function haveSameSpells(spellsA, spellsB){
    if(spellsA.length != spellsB.length)
        return false;

    for(let s of spellsA){
        if(!spellsB.includes(s))
            return false;
    }

    return true;
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

function initOptions(){
    if(hasData(OPTIONS_DATA))
        return;

    options = {};
    options["clipboard_url"] = true;
    options["clipboard_list"] = true;
    options["clipboard_group"] = true;
    saveData(OPTIONS_DATA, options);
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

function clearFilters(){
    for(let f in filters){
        filters[f] = noHide;
    }
    $("#search_name").val("");
    $("#level").prop("selectedIndex", 0);
    $("#class").prop("selectedIndex", 0);
    $("#school").prop("selectedIndex", 0);
    $("#added").prop("selectedIndex", 0);
    $("select").material_select();
    generateTable();
}

// Spells Functions

function createSpellbook(spells, name = "New", colours = null){
    let obj = {};
    obj.name = name;
    obj.spells = spells;
    if(colours != null && colours != undefined && colours != {})
        obj.colours = colours;
    return obj;
}

function addSpell(s) {
    var spellbook = getSpells();
    if (spellbook.spells.indexOf(s) >= 0){
        spellbook.spells.splice(spellbook.spells.indexOf(s), 1);
        if(spellbook.colours != undefined)
            delete spellbook.colours[s];
    }
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

function clearSpells(force = false) {
    if (force || confirm("Are you sure you want to clear the current spellbook?")) {
        saveData(CURRENT_DATA, createSpellbook([]));
        setView();
    }
}

function setSpellColour(spellName, colour){
    let spellbook = getSpells();
    if(spellbook.colours == undefined)
        spellbook.colours = {};
    if(colour != "")
        spellbook.colours[spellName] = colour;
    else   
        delete spellbook.colours[spellName];
    saveData(CURRENT_DATA, spellbook);
}

function saveSpellbook(name) {
    var spellbooks = getSpellbooks();
    var sb = getSpells();
    var contains = false;
    for (var i = 0; i<spellbooks.length; i++) {
        var s = spellbooks[i];
        if (s.name == name) {
            s.spells = sb.spells;
            s.colours = sb.colours;
            contains = true;
        }
    }
    if (!contains) {
        spellbooks.push(createSpellbook(sb.spells, name, sb.colours));
    }
    sb.name = name;
    saveData(CURRENT_DATA, sb);
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
    var name = prompt("Choose a name for the spellbook.", getSpells().name);
    if (name==null || name.length==0) return;
    saveSpellbook(name);
}

function loadSpellbook(name) {
    if (!confirm("Are you sure you want to load spellbook \""+name+"\"? This will clear the current spellbook and any changes will be lost.")) return;
    var spellbooks = getSpellbooks();
    for (var i = 0; i<spellbooks.length; i++) {
        if (spellbooks[i].name == name) {
            saveData(CURRENT_DATA, spellbooks[i]);
            generateSpellbooks();
            return;
        }
    }
}

function saveToClipboard(){
    let options = loadData(OPTIONS_DATA);
    let currentSpells = getSpells().spells.sort();

    if(options["clipboard_group"]){
        currentSpells = currentSpells.sort(function(a,b){
            return spells[a]["level"] < spells[b]["level"] ? -1 : (spells[a]["level"] == spells[b]["level"] ? 0 : 1);
        });
    }

    let link = "charsleyj.github.io/Spellbook/?s=";
    let list = "";
    let level = null;
    for(let s=0; s<currentSpells.length; ++s){
        let spell = spells[currentSpells[s]]

        if(options["clipboard_group"] && spell["level"] != level){
            level = spell["level"];
            list += "\nLevel " + level + ":\n";
        }

        link += spell["id"] + (s == currentSpells.length-1 ? "\n" : ",");
        list += spell["name"] + "\n";
    }
    let ans = "";
    ans += options["clipboard_url"] ? link : "";
    ans += options["clipboard_list"] ? list : "";
    navigator.clipboard.writeText(ans.trim());
}



// View Functions

function setView(newView = view){
    view = newView;
    switch(view){
        case "spells":
            $("#sorters").show();
            generateTable();
            break;
        case "spellbooks":
            $("#sorters").hide();
            generateSpellbooks();
            break;
        case "options":
            $("#sorters").hide();
            generateOptions();
            break;
    }
}

function generateSpellbooks() {
    var spellList = getSpells();
    var ans = "";
    var spellbooks = getSpellbooks();

    ans+="<div class='container'>";

    ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='saveCurrentBook();'>Save Spellbook As...</button> <button type='button' class='btn' onclick='clearSpells();'>Clear Spellbook</button> <button type='button' class='btn' onclick='saveToClipboard();'>Save to Clipboard</button> <h1 class='sb-name'>Current: "+spellList.name+"</h1>";
    ans+=generateSpellNames(spellList.spells)+"</div>";

    for (var i = 0; i<spellbooks.length; i++) {
        var sb = spellbooks[i];
        ans+="<div class='card' style='text-align: center'><button type='button' class='btn' onclick='deleteSpellbook(\""+sb.name+"\");'>Delete Spellbook</button> <button type='button' class='btn' onclick='loadSpellbook(\""+sb.name+"\");'>Load Spellbook</button><h1 class='sb-name'>"+sb.name+"</h1>";
        ans+=generateSpellNames(sb.spells)+"</div>";
    }

    ans+="</div><div class='col-lg-2'></div>";

    $(".table").html(ans);
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
    for (var key in spells) if (spells.hasOwnProperty(key) && isShown(key)) sortable.push([key, spells[key]]);
    sortable.sort(function(a, b) {
        return (reverse ? -1 : 1) * (a[1]["name"] < b[1]["name"] ? -1 : a[1]["name"] > b[1]["name"] ? 1 : 0); //if reverse is true, sort in the opposite direction.
    });
    sortable.sort(function(a, b) {
        return (reverse ? -1 : 1) * (a[1][sort] < b[1][sort] ? -1 : a[1][sort] > b[1][sort] ? 1 : 0); //if reverse is true, sort in the opposite direction.
    });

    console.log("Number of spells: " + sortable.length);

    var ans = "<table class='table'><thead class='thead-inverse'><tr><th>Full</th><th class='sort' onclick='setSort(\"name\");'>Name</th><th class='sort' onclick='setSort(\"level\");'>Level</th><th class='sort' onclick='setSort(\"school\");'>School</th><th class='sort' onclick='setSort(\"range\");'>Range</th><th class='sort' onclick='setSort(\"casting_time\");'>Casting Time</th><th class='sort' onclick='setSort(\"components\");'>Components</th><th>Spellbook</th></tr></thead>";

    currentTableSpells = [];
    for (var i = 0; i<sortable.length; i++)  {
        var arr = sortable[i];
        var name = arr[0];
        var spell = arr[1];
        var slug = arr[1].slug;

        currentTableSpells.push(name);

        if(sortsWithDividers.includes(sort) && (i == 0 || sortable[i][1][sort] != sortable[i-1][1][sort])) {
            ans += "<tr class='spell-divider'><td colspan='100%' class='row'>";
            ans += (sort == "level" && spell[sort] == 0) ? "Cantrip" : spell[sort];
            ans+="</td></tr>";
        }

        ans+="<tr id=\"row-"+slug+"\" style='background-color: " + (i % 2 == 0 ? "#ffffff" : "#f4f4f4") + "'>";
        ans+="<td><button type='button' data-toggle='collapse' href='#full-"+slug+"' class='btn' onclick='hide(\""+slug+"\");' id=\""+slug+"\" >Show</button></td>";
        //ans+="<td><a href='#' data-activates='full-"+slug+"' class='button-collapse'>test</a></td>";
        //ans+="<td data-toggle='tooltip' data-placement='right' title='"+(spell["description"].length>399 ? spell["description"].substr(0,400)+"..." : spell["description"])+"'>"+spell.name;
        ans+="<td>"+spell.name;
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
        ans+="<td id='a-"+slug+"' style='text-align: right; padding-right: 15px'>" + generateActions(slug, name) + "</td>";
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
        ans+="<b>Description:</b>"+spell["description"];
        if(spell["athigherlevel"].length > 0)
            ans+="<b>At Higher Levels:</b>"+spell["athigherlevel"];
        
        ans+="<em style='font-size: .75em;'>Sources: ";
        for(let s=0; s<spell["sources"].length; ++s){
            ans+=spell["sources"][s]
            ans+=(spell["pages"][s] != "") ? " (pg. " + spell["pages"][s] + ")" : "";
            ans+=(s < spell["sources"].length-1) ? ", " : "";
        }
        ans+="</em><br/>";

        ans+="Links: <a href=\"http://dnd5e.wikidot.com/spell:" + spell["slug"] + "\" target=\"_blank\">WikiDot</a><br/>"

        ans+="</div></blockquote></td></tr>";
    }

    ans+="</table>";
    $(".table").html(ans);
    $(".button-collapse")

    const colouredSpells = getSpells().colours;
    if(colouredSpells != undefined){
        for(let s of Object.keys(colouredSpells)){
            updateRowColour(spells[s].slug, s, colouredSpells[s]);
        }
    }
}

function generateActions(slug, name){
    let ans = "";
    if(hasSpell(name))
        ans += "<button type='button' class='btn' onclick='changeColourAction(\""+slug+"\", \""+name+"\")'><i class='material-icons'>colorize</i></button>";
    ans += "<button type='button' class='btn' onclick='addSpellAction(\""+slug+"\", \""+name+"\")'>"+(hasSpell(name) ? "<i class='material-icons'>remove</i>" : "<i class='material-icons'>add</i>")+"</button>";
    return ans;

}

function addSpellAction(slug, name){
    addSpell(name);
    $("#a-"+slug).html(generateActions(slug, name));
    updateRowColour(slug, name, undefined);
}

function changeColourAction(slug, name){
    const colours = getSpells().colours;
    const defaultValue = (colours == undefined || colours[name] == undefined) ? "" : colours[name];

    const newColour = prompt("Type a valid HTML colour to change the tint colour, or leave it blank to have no tint.", defaultValue);
    if(newColour == null)
        return;

    if(!CSS.supports("background-color", newColour) && newColour != ""){
        alert("Given input is not a valid HTML colour");
        return;
    }

    setSpellColour(name, newColour);
    updateRowColour(slug, name, newColour);
}

function updateRowColour(slug, spellName, tintColour) {
    const row = currentTableSpells.indexOf(spellName);
    if(row < 0)
        return;

    const colours = getSpells().colours;
    const baseColour = row % 2 == 0 ? "#ffffff" : "#f4f4f4";
    const backgroundColour = tintColour == undefined ? baseColour : "color-mix(in srgb, "+baseColour+", "+tintColour+" 25%)";
    
    $("#row-" + slug).css("background-color", backgroundColour);
}

function generateOptions(){
    let options = loadData(OPTIONS_DATA);

    var ans = "";
    ans+="<div class='container' style='text-align: center'><h1>Options</h1>";
    ans+="<div class='card'><h2 class='sb-name'>Clipboard</h2><form style='text-align: left'>";
    ans+=generateOptionCheckbox('options_cb_url', "Show URL", options["clipboard_url"], "clipboard_url");
    ans+=generateOptionCheckbox('options_cb_list', "Show Spell List", options["clipboard_list"], "clipboard_list");
    ans+=generateOptionCheckbox('options_cb_group', "Group by Level", options["clipboard_group"], "clipboard_group");
    ans+="</form></div>";
    ans+="</div><div class='col-lg-2'></div>";
    $(".table").html(ans);
}

function generateOptionCheckbox(id, text, value, option){
    ans = "<input type='checkbox' onclick='saveOption(\"" + option + "\", this.checked)'";
    ans += (value ? "checked='true'" : "");
    ans += "id='" + id + "'><label for='" + id + "'> " + text + "</label><br>";
    return ans;
}

function saveOption(option, value){
    let options = loadData(OPTIONS_DATA);
    options[option] = value;
    saveData(OPTIONS_DATA, options);
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
const OPTIONS_DATA = "options";

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
var currentTableSpells = [];

getJSONData();
initOptions();
