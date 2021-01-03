---
layout: post
title: Itérateurs en Lua
date: 2020-05-01
categories: lua
---

https://stackoverflow.com/questions/50748131/what-is-the-type-signature-of-pairs-in-lua
https://pgl.yoyo.org/luai/i/next

## Iterateurs basique

```lua
local my_array = { 'a', 'b', 'c', 'd', 'e'}

for index, value in ipairs(my_array) do
	print(index, value)
end
```

```lua
local my_map = { a = 1, b = 2, c = 3, d = 4, e = 5}

for key, value in pairs(my_map) do
	print(key, value)
end
```

## Next

reimplementation of 
for k, v in pairs(table) end

```lua
  local test = { a = 1, b = 2, c = 3, d = 4, e = 5}

  function iterate(table, fn)
      local k, v = next(table)
      while true do
          if k == nil then break end
          fn(k, v)
          k, v = next(table, k)
      end
  end

  iterate(test, function(k, v) 
      print(k, v)
  end)
```

## Iterateurs custom

pairs() returns three separate values:

    a function to call with parameters (table, key) that returns a key and value
    the table you passed to it
    the first 'key' value to pass to the function (nil for pairs(), 0 for ipairs())

```lua
function reversed_ipairs(table)
	local function reverse(table, index)
		index = index - 1
		if index ~= 0 then return index, table[index] end
	end
	return reverse, table, #table + 1
end

local my_array = { 'a', 'b', 'c', 'd', 'e'}

for i, v in reversed_ipairs(my_array) do 
	print(i, v)
end
```


```lua
for k,v in pairs({a=1, b=13, c=169}) do print(k, v) end
```

Can be done like this:

```lua
local f,t,k = pairs({a=1, b=13, c=169})
local v
print('first k: '..tostring(k))
k,v = f(t, k)
while k ~= nil do
  print('k: '..tostring(k)..', v: '..tostring(v))
  k,v = f(t, k)
end
```


	Allows a program to traverse all fields of a table. Its first argument is a table and its second argument is an index in this table. next returns the next index of the table and its associated value. When called with nil as its second argument, next returns an initial index and its associated value. When called with the last index, or with nil in an empty table, next returns nil. If the second argument is absent, then it is interpreted as nil. In particular, you can use next(t) to check whether a table is empty.

	The order in which the indices are enumerated is not specified, even for numeric indices. (To traverse a table in numeric order, use a numerical for or the ipairs function.)

	The behavior of next is undefined if, during the traversal, you assign any value to a non-existent field in the table. You may however modify existing fields. In particular, you may clear existing fields. 
