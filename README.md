# Spellbook
An HTML and JavaScript DnD Spellbook | https://charsleyj.github.io/Spellbook/



## Spells Data Format

The data for the spells is in JSON in the below format. Below are descriptions for each of the required and optional properties, as well as several currently unused properties:

``` json
{
	"Spell1": {
        ...Spell properties...
    },
    "Spell2": {
    ...
}
```

**Required Properties:**

- `athigherlevel`: (String) The text of what the spell does if cast at a higher level or for how cantrips get more powerful if the character is at a higher level.
- `casting_time`: (String) How long it takes to cast.
- `classes`: (String Array) List of the classes the spell belongs to. Must be purely a capitalised class name with no subclasses.
- `components`: (String) The VSM components the spell required.
- `concentration`: (String) Does the spell required concentration? Must be either "Yes" or "No"
- `description`: (String) Description of the spell
- `duration`: (String) How long the spell lasts.
- `id`: (String) A numerical ID for the spell. Each spell must have a unique ID
- `level`: (String) The level of the spell from "0" (cantrips) to "9"
- `name`: (String) The display name of the spell.
- `range`: (String) The range of the spell
- `ritual`: (String) Can the spell be ritual cast? Must be either "Yes" or "No"
- `school`: (String) The school the spell belongs to. Must be purely a capitalised school name.
- `slug`: (String) A text id for the spell which must be unique. Typically its the spell display name in all lowercase, spaces replaced by '-' and no other puncuation.
- `pages`: (String Array) Each string is the page numbers the spell can be found in the corresponding source. If the page numbers are unknown it should be an empty string. Must have the same number of elements as `sources`.
- `sources`: (String Array) Each string is the name of a source the spell is from. Must have the same number of elements as `pages`

**Optional Properties**

- `castingtime_detail` (String) Additional details of the casting time. Typically used for reaction spells.
- `range_detail` (String) Additional detailed of the range. Typically used when range is Self.
- `components_detail` (String) THe specific material components required.

**Unused Properties**

- `srd`: (String) Is the spell part of the SRD. Is either "5.0". "5.1" or "" if is not part of the SRD.
- `srd_name` (String) The name of the spell as listed in the SRD.
- `tags`: (String Array) Additional tags for the spells.



## Credit

This is a fork of a project by [Ben Wyatt (GoogleBen)](https://github.com/googleben). The original code is available at https://github.com/googleben/Spellbook.

