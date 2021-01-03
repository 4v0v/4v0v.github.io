---
layout: post
title: Timer
date: 2019-05-04
categories: lua
author: 4v0v
---

# Création d'un module de timer

Jusqu'à présent dans tous les jeux créés, nous avons besoin de timers pour faire dérouler les évènements.
J'aimerai automatiser leur créations pour créer des effets à partir de chaînes de timers.


On créer un nouveau fichier appelé ``timer.lua``

```lua 
-- timer.lua --
local Timer = {}
    -- corps du module
return Timer
```
Lorsque dans ``main.lua`` on appelle la fonction ```lua require("chemindumodule")```, ce que nous retourne la fonction est ce que retourne le module.

```lua
local Timer = {}

function Timer:new()
    local obj = {}
        obj.timers = {}
        obj.after = Timer.after
        obj.update = Timer.update
    return obj
end


function Timer:after(tag, time, func)
    if not self.timers[tag] then return false end 

    self.timer[tag] = {
        mode = "after",
        t    = 0,
        time = time,
        func = func
    }

end

function Timer:update(dt)
    for k, v in pairs(self.timers) do 
        v.t = v.t + dt

        if v.mode == "after" then 
            if v.t > v.timer then 
                v.func()
                self.timers[k] = nil
            end
        end
    end
end

return Timer
```

Grâce à ``Timer:new()`` on crée un objet général qui contiendra tous nos timers.
Quand on appelle ``obj:after(tag, time, func)`` on crée une table dans ``obj.timers``.
A chaque appelle de ``obj:update(dt)``, dt sera ajouté à toutes les tables de timers et si le temps ``t`` est supérieur à ``time``, la fonction s'exécute.


```lua
function Timer:during(tag, time, func, after)
    if not self.timers[tag] then return false end 

    self.timer[tag] = {
        mode = "during",
        t    = 0,
        time = time,
        func = func,
        after = after or function() end
    }
end

function Timer:update(dt)
    for k, v in pairs(self.timers) do
        v.t = v.t + dt

        if v.mode == "after" then
            if v.t > v.timer then
                v.func()
                self.timers[k] = nil
            end

        elseif v.mode == "during" then+
            v.func()
            if v.t > v.timer then
                if v.after then v.after() end
                self.timers[k] = nil
            end
        end
    end
end

return Timer
```
A chaque appel de obj:update(dt), la fonction during s'exécutera puis appellera after() .

```lua
function Timer:every(tag, time, func, nb_occur, after)
    if not self.timers[tag] then return false end 

    self.timer[tag] = {
        mode = "every",
        t    = 0,
        time = time,
        func = func,
        nb_occur = nb_occur or -1,
        o = 0
        after = after or function() end
    }
end

function Timer:update(dt)
    for k, v in pairs(self.timers) do
        v.t = v.t + dt

        if v.mode == "after" then
            if v.t > v.timer then
                v.func()
                self.timers[k] = nil
            end

        elseif v.mode == "during" then+
            v.func()
            if v.t > v.timer then
                if v.after then v.after() end
                self.timers[k] = nil
            end

        elseif v.mode == "every" then 
            if v.t > v.timer then
                v.func()
                v.t = v.t - v.timer
                v.o = v.o + 1
                if v.o == v.nb_occur then 
                    if v.after then v.after() end
                    self.timers[k] = ni
                end
            end
        end
    end
end

return Timer
```
La fonction obj:every() est plus ou moins similaire à une chaîne d'after. Si on ne donne pas de nombre d'occurence, le timer s'executera indéfiniment.