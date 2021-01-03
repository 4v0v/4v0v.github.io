---
layout: post
title: Monkeypatcher lua pour ajouter de la syntaxe
date: 2020-05-07
categories: lua
---

Ajouter += en lua

https://github.com/bartbes/Meta

## gstring
https://pgl.yoyo.org/luai/i/string.gsub



## require()

https://pgl.yoyo.org/luai/i/package.loaders

## code

```lua
table.insert(package.loaders, 1, function(name)
	local name = name:gsub("%.", "/") .. ".lua"
    local file = love.filesystem.read(name)
    if not file then return nil end

    local var = "([%w%.:_%[%]'\"]+)"
	for i, v in ipairs(
        {
            { pattern = var .. "%s*%+=" , replacement = "%1 = %1 + "}, -- +=
            { pattern = var .. "%s*%-=" , replacement = "%1 = %1 - "},  -- -=
            { pattern = var .. "%s*%*=" , replacement = "%1 = %1 * "}, -- *=
            { pattern = var .. "%s*/="  , replacement = "%1 = %1 / "}, -- /=
            { pattern = var .. "%s*^="  , replacement = "%1 = %1 ^ "}, -- ^=
            { pattern = var .. "%s*%%=" , replacement = "%1 = %1 %% "}, -- %=
            { pattern = var .. "%s*%..=", replacement = "%1 = %1 .. "}, -- ..=
            { pattern = var .. "%+%+"   , replacement = "%1 = %1 + 1"}, -- ++
            { pattern = "&&"            , replacement = " and "},
            { pattern = "||"            , replacement = " or "},
            { pattern = "!="            , replacement = "~="},
            { pattern = "!"             , replacement = " not "},
        }
    ) do 
		file = file:gsub(v.pattern, v.replacement) 
	end
	return assert(loadstring(file, name))
end)
```


