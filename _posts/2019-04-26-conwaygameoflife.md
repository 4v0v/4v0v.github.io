---
layout: post
title: Jeu de la vie de Conway
date: 2019-04-26
categories: lua
author: 4v0v
---

<center><video autoplay="false" loop="loop" width="512" height="512">
  <!-- <source src="/assets/images/lorenz.mp4" type="video/mp4"> -->
  <source src="/assets/videos/conway.webm" type="video/webm">
</video></center>

**Règles:**

Le jeu se déroule sur une grille
Chaque cellule de la grille a 2 états , mort ou vivant
Le jeu se déroule tour par tour

A chaque tour, on regarde pour chaque cellule ses 8 voisines directes :
+ si 3 voisines vivantes **=>** vivante à l'étape suivante
+ si 2 voisines vivantes **=>** garde son état actuel à l'étape suivante
+ sinon **=>** morte à l'étape suivante



Il nous faut donc :

+ **Partie initialisation :** 
    + Créer une grille de jeu
    + Créer les variables pour dessiner la grille
    + Créer un timer

+ **Partie update :**
    + Peupler la grille de cellules vivantes à l'aide de la souris
    + Lancer la partie via le timer
    + Faire avancer les tours de jeu
    + Réinitialiser la grille et le timer

+ **Partie draw :**
    + Afficher la grille ainsi que l'état des cellules




## Créer la grille

Notre but est de réaliser une table à ce format (pour une taille de 4): 

```lua
grid = {
	{0, 0, 0, 0},
	{0, 0, 0, 0},
	{0, 0, 0, 0},
	{0, 0, 0, 0}
}
```

On crée la fonction ``create_grid()`` qui prend en paramètre une ``taille``:

```lua
function create_grid(s)
    local result = {}  -- création de la variable local qui contiendra la grille finale
    for i = 1, s do -- pour chaque ligne
        local row = {}	-- on crée la variable locale qui contiendra la ligne en cours
        for j = 1, s do 	-- pour chaque colonne
            table.insert(row, 0) -- on insert dans la variable précédement créée un 0
        end
        table.insert(result, row) -- on insert la variable row, qui est maintenant au format {0, 0, 0, 0} dans la variable result
    end	-- à chaque itération, la variable row est détruite
    return result -- le retour de resultat  nous permet de faire 'grid = create_grid(size)'
end
```

A noter:
On fait une boucle for dans une boucle for, c'est important de comprendre à quoi font référence i et j et quand est ce qu'on peut les utiliser à l'intérieur des boucle.
(cf article sur les boucles)

table.insert(table ou on veut insérer, ce qu'on insert) permet d'insérer une valeur au début ??? d'une table, attention à bien remarquer que la table a uniquement des index chiffrés (forat liste), si la liste contient des index de clé l'utilisation de table.insert() n'est pas recommandé. 
D'ordre général, mélanger les index numériques et les clé n'est pas une bonne idée.

Il est important de comprendre l'étendu (scope) des variables locales
(cf article sur le scope)

Avec notre grid crée, pour accéder à la 3eme ligne 2 eme colonne il suffi de faire ``grid[3][2]``


# Les variables

```lua
game_width = love.graphics.getWidth() -- récupération de la largeur de l'écran
game_height = love.graphics.getHeight() -- récupération de la hauteur de l'écran
grid_size = 100 -- nombre de case en hauteur & largeur
timer = 0 -- initialisation d'un timer
t = 0.2 -- temps entre les étapes
grid = create_grid(grid_size)
restart_key = "a"
start_key = "z"
state = "init grid"
```

# Afficher la grille

```lua
function love.draw()
    for i = 1, size do 
        for j = 1, size do  -- double itération pour dessiner chaque case
            if grid[i][j] ~= 0 then -- si la case est "en vie"
                love.graphics.rectangle("fill", -- mode remplissage
                    (i-1) * game_width)/size,   -- position de x, le -1 empêche l'offset
                    (j-1) * game_height/size,   -- position de y, le -1 empêche l'offset
                    game_width/size,            -- largeur d'une colonne
                    game_height/size            -- hauteur d'une colonne
                )
            end
        end
    end
end
```
A noter : 
En lua, les indexs commencent par 1 contrairement à d'autres langages de programmation. De ce fait on commence aussi les itérations par 1 et non par 0. 
Certains utilisent cet argument pour dire que Lua est un mauvais langage, personnellement je trouve qui si cette subtilité empêche quelqu'un de coder c'est qu'il n'est pas fait pour code.
On peut aussi voir qu'une inégalité s'écrit  ~= et pas !=. Même constat.

Pour l'instant le code doit ressemble à ça: 


<details><summary markdown="span">**main.lua**</summary>

```lua
function create_grid(s)
    local result = {}  
    for i = 1, s do 
        local row = {}	
        for j = 1, s do
            table.insert(row, 0)
        end
        table.insert(result, row)
    end	
    return result
end

function love.load()
    game_width = love.graphics.getWidth()
    game_height = love.graphics.getHeight()
    size = 100
    timer = 0
    grid = create_grid(grid_size)
end

function love.update(dt)

end

function love.draw()
    for i = 1, size do
        for j = 1, size do
            if grid[i][j] ~= 0 then
                love.graphics.rectangle("fill",
                    (i-1) * game_width)/size,  
                    (j-1) * game_height/size,  
                    game_width/size,
                    game_height/size
                )
            end
        end
    end
end
```
</details>
<details><summary markdown="span">**conf.lua**</summary>

```lua
function love.conf(t)
    t.console          = true
    t.window.width     = 600
    t.window.height    = 600
    -- t.window.x         = 
    -- t.window.y         = 
end
```
</details>


# Transformer la grille

Pour écrire un algorithme, il faut décortiquer le plus possible les étapes de la transformation d'une valeur en une autre.
La plupart du temps je pars de la situation la plus simple possible avec des valeurs réelles.
Ensuite je cherche à généraliser cette situation.
puis je réfléchi aux exeptions.
Je fais du ping pong entre ces étapes jusqu'à un résultat qui me semble convenable.
Je test ensuite dans un environnement restreint
Puis je l'applique réellement à mon jeu.
Suivant la longueur de l'algorithme je saute ou rajoute des étapess.

Par exemple on a une grille de 3 par 3 et on veut connaitre l'état de la cellule centrale:
la case a une coordonnée de 2, 2

On va d'abord regarder la cellule 1, 1  puis 1, 2, puis 1,3 puis 2,1 puis 2, 3 puis 3,1; 3,2; 3,3
Ce qui veut dire que par rapport à la cellule x, y on va chercher x-1, y-1, x-1, y

Cependant il est possible de vérifier une cellule dans un coin, qui n'a donc pas 8 cellules voisines [IMAGE]

Il faut donc d'abord regarder si la cellule voisine existe.

Pour se faire, on regarde si la cellule grid[x-1][y-1] existe pour le (coin supérieur droit). cependant on ne peut pas vérifier [y-1] si [x-1] n'existe déjà pas.
On doit donc faire la vérification en 2 étapes, d'abord grid[x-1] puis grid[x-1[y-1].

```lua
    local result -- total des voisines vivantes
    if grid[i-1] and grid[i-1][j-1] then 
        if grid[i-1][j-1] == 1 then
            result = result + 1
        end 
    end
```

On refait la même chose avec les 7 autres voisines :

```lua
local result = 0 -- total des voisines vivantes

if grid[i-1] and grid[i-1][j-1] then if grid[i-1][j-1] == 1 then result = result + 1 end
if grid[i-1] and grid[i-1][j]   then if grid[i-1][j]   == 1 then result = result + 1 end
if grid[i-1] and grid[i-1][j+1] then if grid[i-1][j+1] == 1 then result = result + 1 end
if grid[i]   and grid[i][j-1]   then if grid[i][j-1]   == 1 then result = result + 1 end
if grid[i]   and grid[i][j+1]   then if grid[i][j+1]   == 1 then result = result + 1 end
if grid[i+1] and grid[i+1][j-1] then if grid[i+1][j-1] == 1 then result = result + 1 end
if grid[i+1] and grid[i+1][j]   then if grid[i+1][j]   == 1 then result = result + 1 end
if grid[i+1] and grid[i+1][j+1] then if grid[i+1][j+1] == 1 then result = result + 1 end
```

La variable result contiendra un chiffre de 0 à 8.

Il nous reste à appliquer les règles du jeu sur ce chiffre :


```lua
if result == 3 then 
    new[i][j] = 1 -- la cellule sera vivante dans la nouvelle grille
elseif r == 2 then 
    new[i][j] = old[i][j] -- la cellule gardera son état
else
    new[i][j] = 0 -- la cellule meurt dans la nouvelle grille
end
```

La fonction prend comme paramètre l'ancienne grille et la taille

```lua
function transform_grid(old)
    local size = #old
    local new = create_grid(size)

    for i = 1, size do
        for j = 1, size do 
            local result = 0

            if old[i-1] and old[i-1][j-1] then if old[i-1][j-1] == 1 then result = result + 1 end
            if old[i-1] and old[i-1][j]   then if old[i-1][j]   == 1 then result = result + 1 end
            if old[i-1] and old[i-1][j+1] then if old[i-1][j+1] == 1 then result = result + 1 end
            if old[i]   and old[i][j-1]   then if old[i][j-1]   == 1 then result = result + 1 end
            if old[i]   and old[i][j+1]   then if old[i][j+1]   == 1 then result = result + 1 end
            if old[i+1] and old[i+1][j-1] then if old[i+1][j-1] == 1 then result = result + 1 end
            if old[i+1] and old[i+1][j]   then if old[i+1][j]   == 1 then result = result + 1 end
            if old[i+1] and old[i+1][j+1] then if old[i+1][j+1] == 1 then result = result + 1 end

            if     result == 3 then new[i][j] = 1 
            elseif result == 2 then new[i][j] = old[i][j] 
            else                    new[i][j] = 0         end
        end
    end
    return new
end
```

# timer

```lua
function love.update(dt)
    if state = "init grid" then 
        local mouse_x, mouse y = love.mouse.getPosition() -- on récupère la position de la souris

        -- on la transforme pour qu'elle soit dans l'interval 1 - 100
        local mouse_x = math.floor(mouse_x / (love.graphics.getWidth()/size))) + 1 
        local mouse_y = math.floor(mouse_y / (love.graphics.getHeight()/size))) + 1

        -- si clic gauche cellule vit, si clic droit meurt
        if love.mouse.isDown(1) then grid[mouse_x][mouse_y] = 1 end
        if love.mouse.isDown(2) then grid[mouse_x][mouse_y] = 0 end

    elseif state == "play" then -- si le jeu a démarré
        timer = timer + dt -- a chaque frame, on ajoute sa durée
        if timer > t then -- au moment ou le timer atteind t on appelle 1 fois le corps de la boucle

            --do_stuff()

            timer = timer - t -- on pourrai faire timer = 0 mais il ne faut pas oublier le delta entre timer & t
        end
    end
end
```
note: Lua ne supporte pas l'écriture +=, -=, *=, /=

# keypressed callback
```lua
function love.keypressed(key)
    if key == restart_key then 
        grid = create_grid(size)
        state = "init grid"
        timer = 0
    end

    if key == start_game then 
        state = "play"
    end
end
```



# CODE COMPLET

<details><summary markdown="span">**main.lua**</summary>

```lua
function create_grid(s)
    local result = {}  
    for i = 1, s do 
        local row = {}	
        for j = 1, s do
            table.insert(row, 0)
        end
        table.insert(result, row)
    end	
    return result
end

function transform_grid(old)
    local grid_size = #old
    local new = create_grid(grid_size)

    for i = 1, grid_size do
        for j = 1, grid_size do 
            local result = 0

            if old[i-1] and old[i-1][j-1] then if old[i-1][j-1] == 1 then result = result + 1 end end
            if old[i-1] and old[i-1][j]   then if old[i-1][j]   == 1 then result = result + 1 end end
            if old[i-1] and old[i-1][j+1] then if old[i-1][j+1] == 1 then result = result + 1 end end
            if old[i]   and old[i][j-1]   then if old[i][j-1]   == 1 then result = result + 1 end end
            if old[i]   and old[i][j+1]   then if old[i][j+1]   == 1 then result = result + 1 end end
            if old[i+1] and old[i+1][j-1] then if old[i+1][j-1] == 1 then result = result + 1 end end
            if old[i+1] and old[i+1][j]   then if old[i+1][j]   == 1 then result = result + 1 end end
            if old[i+1] and old[i+1][j+1] then if old[i+1][j+1] == 1 then result = result + 1 end end

            if     result == 3 then new[i][j] = 1 
            elseif result == 2 then new[i][j] = old[i][j] 
            else                    new[i][j] = 0         end
        end
    end
    return new
end

function love.load()
    game_width = love.graphics.getWidth()
    game_height = love.graphics.getHeight()
    grid_size = 100
    timer = 0
    t = 0.1
    state = "init_grid"
    restart_key = "a"
    start_key = "z"
    grid = create_grid(grid_size)
end

function love.update(dt)
    if state == "init_grid" then
        local mouse_x, mouse_y = love.mouse.getPosition()
        local mouse_x = math.floor(mouse_x / (game_width/grid_size)) + 1 
        local mouse_y = math.floor(mouse_y / (game_height/grid_size)) + 1

        if love.mouse.isDown(1) then grid[mouse_x][mouse_y] = 1 end
        if love.mouse.isDown(2) then grid[mouse_x][mouse_y] = 0 end

    elseif state == "play" then
        print('lol')
        timer = timer + dt
        if timer > t then
            grid = transform_grid(grid)
            timer = timer - t 
        end
    end
end

function love.draw()
    for i = 1, grid_size do
        for j = 1, grid_size do
            if grid[i][j] ~= 0 then
                love.graphics.rectangle("fill",
                    (i-1) * game_width/grid_size,  
                    (j-1) * game_height/grid_size,  
                    game_width/grid_size,
                    game_height/grid_size
                )
            end
        end
    end
end

function love.keypressed(key)
    if key == restart_key then 
        grid = create_grid(grid_size)
        state = "init_grid"
        timer = 0
    end

    if key == start_key then 
        state = "play"
    end
end
```
</details>
<details><summary markdown="span">**conf.lua**</summary>

```lua
function love.conf(t)
    t.console          = true
    t.window.width     = 600
    t.window.height    = 600
    -- t.window.x         = 
    -- t.window.y         = 
end
```
</details>