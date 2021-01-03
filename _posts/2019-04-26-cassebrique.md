---
layout: post
title: Casse brique et la programmation orientée objet en Lua
date: 2019-04-26
categories: lua
author: 4v0v
---

Casse brique et l’OOP



Pour créer un casse brique il faut 4 composants : 
-	Un pad
-	Des briques
-	Des murs
-	Une balle

Pour faire simple on va représenter tout ces composants par des rectangles de différentes couleurs.
Le pad peut se déplacer quand on appuie sur les touches du clavier
La balle se déplace automatiquement et ricochant sur les murs, les briques et le pad
Les briques disparaissent lorsqu’elles entrent en contact avec la balle

Pour dessiner un rectangle d’une certaine couleur il faut faire dans la fonction love.draw() : 

Love.graphics.setColor(r,g,b,a) 
Love.graphics.rectangle(mode, x, y, w, h)
Love.graphics.setColor(1,1,1,1)

Les paramètres rgba sont ”normalisés”, un terme important qui signifie que leur valeur est minimale à 0 et maximale est 1. Aussi simple que ça.

A la place de composants, on peut appeller chaque élément une ’entité’. 

Chaque entité a donc :
-	une couleur
-	des mesures
-	une facon d’être mise à jour
-	une façon d’être dessinée

local brique = {
	x = 100
	y = 100
	w = 400
	h = 200
	color = { mode=”line”, r = 1, g = 0, b = 0,  a = 1 }
}

Local brique_draw(b)
	Love.rectangle.draw(b.mode, b.x, b.y, b.w, b.h)
end

local brique_update(dt, b)
do_stuff
end

Dans ce cas là, on a une fonction en dehors de la table brique qui prend une brique en paramètre et la dessine. Ce serai bien de lier directement la fonction à la brique.
en lua , pour rappel, les fonctions sont des variables comme les autres, on peut donc lier la fonction à la brique de cette manière :

brique.draw = function(b)
	Love.rectangle.draw(b.mode, b.x, b.y, b.w, b.h)
End

Function brique.draw(b)
Love.rectangle.draw(b.mode, b.x, b.y, b.w, b.h)
end

local brique = {
  draw = function(b) Love.rectangle.draw(b.mode, b.x, b.y, b.w, b.h) End
}

Local brique = {
Function draw(b) Love.rectangle.draw(b.mode, b.x, b.y, b.w, b.h) end
}




Pour appeler la fonction : Brique.draw(brique)

On utilise la fonction brique.draw() avec en paramètre ce même ’brique’

C’est une manière de faire très courrante en programmation et en lua, il existe donc une notation qui permet d’écrire ça plus rapidement grâce aux : Brique:draw()


Il existe aussi un mot clé pour ecrire une fonction qui prend comme paramètre la table qui l’appelle.

Function brique.draw()
	Love.rectangle.Draw(self.mode, self.x, self.y, self.w, self.h)
End

Le mot clé self est implicitement transmis comme paramètre à la fonction et est égal à la table qui  l’appelle.
