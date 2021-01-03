---
layout: post
title: La fourmis de Langton
date: 2019-04-30
categories: lua
author: 4v0v
---

Aujourd'hui on va faire ça :

https://www.youtube.com/watch?v=w7ESrgpQH4k


On pourra récupérer certaines fonctions du Jeu de la vie de Conway.
Nous allons implémenter les fonctionnalités de cette vidéo :

https://www.youtube.com/watch?v=1X-gtr4pEBU


Règles : 
    Si la fourmi est sur une case noire, elle tourne de 90° vers la gauche, change la couleur de la case en blanc et avance d'une case.
    Si la fourmi est sur une case blanche, elle tourne de 90° vers la droite, change la couleur de la case en noir et avance d'une case.


-comment faire pour aller plus vite ?

-faire une fonction qui est propre a la grille elle même



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

function transform_grid(g, a)
    local size = #g
        local old_ant_x = a.x
        local old_ant_y = a.y
        local old_color = g[old_ant_x][old_ant_y]

        if old_color == 0  then g[old_ant_x][old_ant_y] = 1; a.direction = a.direction - 1 end
        if old_color == 1  then g[old_ant_x][old_ant_y] = 0; a.direction = a.direction + 1 end
        if a.direction > 3 then a.direction = 0 end
        if a.direction < 0 then a.direction = 3 end
        
        if a.direction == 0 then a.x = a.x + 1 end
        if a.direction == 1 then a.y = a.y + 1 end
        if a.direction == 2 then a.x = a.x - 1 end
        if a.direction == 3 then a.y = a.y - 1 end

        if a.x > size then a.x = 1    end
        if a.y > size then a.y = 1    end
        if a.x < 1    then a.x = size end
        if a.y < 1    then a.y = size end 
end

function love.load()
    game_width = love.graphics.getWidth()
    game_height = love.graphics.getHeight()
    grid_size = 100
    steps = 25
    timer = 0
    t = 0.01
    state = "init_grid"
    restart_key = "a"
    start_key = "z"
    grid = create_grid(grid_size)
    ant = {x = 50, y = 50, direction = 0}
end

function love.update(dt)
    if state == "init_grid" then
        local mouse_x, mouse_y = love.mouse.getPosition()
        local mouse_x = math.floor(mouse_x / (game_width/grid_size)) + 1 
        local mouse_y = math.floor(mouse_y / (game_height/grid_size)) + 1

        if grid[mouse_x][mouse_y] ~= 1 then
            if love.mouse.isDown(1) then grid[mouse_x][mouse_y] = 2 end
            if love.mouse.isDown(2) then grid[mouse_x][mouse_y] = 3 end
            if love.mouse.isDown(3) then grid[mouse_x][mouse_y] = 0 end
        end

    elseif state == "play" then
        timer = timer + dt
        if timer > t then
            for i = 1, steps do
                transform_grid(grid, ant)
            end

            timer = timer - t 
        end
    end
end

function love.draw()
    for i = 1, grid_size do
        for j = 1, grid_size do
            if grid[i][j] == 0 then
                love.graphics.setColor(0, 0, 0)
                love.graphics.rectangle("fill",
                    (i-1) * game_width/grid_size,  
                    (j-1) * game_height/grid_size,  
                    game_width/grid_size,
                    game_height/grid_size
                )
                love.graphics.setColor(1,1,1)
            elseif grid[i][j] == 1 then
                love.graphics.setColor(1,1,1)
                love.graphics.rectangle("fill",
                    (i-1) * game_width/grid_size,  
                    (j-1) * game_height/grid_size,  
                    game_width/grid_size,
                    game_height/grid_size
                )
                love.graphics.setColor(1,1,1) 
            elseif grid[i][j] == 2 then
                love.graphics.setColor(0,0,0)
                love.graphics.rectangle("fill",
                    (i-1) * game_width/grid_size,  
                    (j-1) * game_height/grid_size,  
                    game_width/grid_size,
                    game_height/grid_size
                )
                love.graphics.setColor(1,1,1) 
            end
        end
    end

    love.graphics.setColor(1,0,0)
    love.graphics.rectangle("fill",
        (ant.x-1) * game_width/grid_size,  
        (ant.y-1) * game_height/grid_size,  
        game_width/grid_size,
        game_height/grid_size
    )
    love.graphics.setColor(1,1,1)
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