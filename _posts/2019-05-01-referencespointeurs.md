---
layout: post
title: Les références et les pointeurs en Lua
date: 2019-05-01
categories: lua
author: 4v0v
---

Les références et les pointeurs sont des concepts soujacents de Lua mais très importants pour comprendre comment coder.

```lua
local x = 100
local y = x
print(x .. ", " .. y)
y = 1
print(x.. ", " .. y)
```
    100, 100
    100, 1

``y`` est d'abord égal à la valeur de ``x``, puis sa valeur change.


```lua
local t1 = { a = 100 }
local t2 = t1
print(t1.a .. ", " .. t2.a)
t2.a = 1
print(t1.a .. ", " .. t2.a)
```
    100, 100
    1, 1

Lorsqu'on écrit ``local t2 = t1``, on ne copie pas la valeur de ``t1`` mais une **référence** à la table ``t1``. ``t2`` n'est pas une table mais un **pointeur** de ``t1``.

Les deux termes sont presque synonymes. Lorsqu'on appelle la table ``t2``, on fait **référence** à / **pointe sur** la table ``t1``.

En faite, lorsqu'on crée une table, Lua crée une zone dans la mémoire vive de l'ordinateur et lui donne un nom, son **adresse**.

```lua
local t1 = {}
print(t1)
```
    table: 0x1fcacae8
    
La variable ``t1`` ne contient rien d'autre qu'une adresse.


```lua
local t1 = { a = 100 }
local t2 = t1
print(tostring(t1) .. ", " .. tostring(t2))
```
    table: 0x36fece10, table: 0x36fece10

``t1`` et ``t2`` sont des **alias** pour le même morceau de mémoire dont l'adresse est ``0x36fece10``.

# Pourquoi faire ?

```lua
local pere = {
    nom = "Papa",
    age = 22
}
local enfant1 = {
    nom = "Jean",
    age = 5
}
local enfant2 = {
    nom = "Marie",
    age = 4
}

pere.enfants = {
    enfant1, enfant2
}
enfant1.pere = pere
enfant2.pere = pere

for i, v in pairs(pere.enfants) do print(v.nom .. ", " .. v.age) end
print(enfant1.pere.nom .. ", " .. enfant1.pere.age)
```
    Jean, 5
    Marie, 4
    Papa, 22

Grâce aux références, on peut accéder au père depuis les enfants et aux enfants depuis le père.

On peut aussi utiliser les références pour permettre à plusieurs table d'accéder à une même autre (les 2 enfants pointent sur le meme pere)

La création d'une table est aussi couteuse en performance, d'autant plus si elle est grande. En comparaison une référence est seulement une adresse et ne coute pas grand chose.

Les fonctions sont aussi passées par référence 

# Comment faire pour copier une table ?

```lua
function copy(t)
    local c = {}
    for k,v in pairs(t) do 

    if type(v) == "table" then 
        c[k] = copy(v)
    else 
        c[k] = v
    end
    return c
end
```

Cette fonction récursive ne fonctionne pas avec des tables imbriquées (enfant a une référence à pere et pere a une référence a enfant) et il manque le support des metatables.

Quand on veut copier une table on fait comme ce qu'on a fait avec les grilles du jeu de conway.
On crée une table vide puis on la rempli avec des valeurs.


# Comment on fait pour supprimer une variable/ table ?

```lua
local t = {a = 1}
local t = nil
print(t)
```
    nil

On pourrai croire qu'ici on supprime la zone mémoire dont l'adresse est ``t`` à la ligne 2.

C'est faux, ce qu'il se passe en faite c'est que nous avons juste coupé le lien entre l'adresse mémoire ``t1`` et la zone mémoire.
Cette zone mémoire existe encore et prend de la place mémoire.

C'est à ce moment qu'intervient le **garbage collector**. A chacun de ses cycles (ou quand il est appellé manuellement) il s'occupe de vider les zones mémoires **qui n'ont plus aucunes références**.

```lua
local pere = {
    nom = "Papa",
    age = 22
}
local enfant1 = {
    nom = "Jean",
    age = 5
}
local enfant2 = {
    nom = "Marie",
    age = 4
}

pere.enfants = {
    enfant1, enfant2
}
enfant1.pere = pere
enfant2.pere = pere

pere = nil
print(pere) -- nil
print(enfant1.pere.nom) -- enfant1 a gardé une référence à pere, la zone mémoire n'est pas supprimée
enfant1.pere = nil
enfant2.pere = nil
-- la zone mémoire pere n'a plus aucune référence pointant vers elle, elle est collectée par le garbage collector
```
    nil
    Papa

**Notes:** C'est une erreur très commune de vouloir détruire une table mais d'avoir gardé un référence à elle autre part, cela peut entraîner des **fuites mémoires**.