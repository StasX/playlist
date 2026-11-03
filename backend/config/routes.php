<?php

use App\Controllers\PlaylistController;
use App\Controllers\SongsController;
use Psr\Container\ContainerInterface;
use Slim\App;

/** @var App<ContainerInterface|null> $app */

$app->get('/api/playlist', [PlaylistController::class, 'getAllPlaylists']);
$app->get('/api/playlist/{id}', [PlaylistController::class, 'getPlaylist']);
$app->post('/api/playlist', [PlaylistController::class, 'createPlaylist']);
$app->put('/api/playlist/{id}', [PlaylistController::class, 'updatePlaylist']);
$app->delete('/api/playlist/{id}', [PlaylistController::class, 'deletePlaylist']);

$app->get('/api/playlist/{id}/songs', [SongsController::class, 'getAllSongs']);
$app->post('/api/playlist/{id}/songs', [SongsController::class, 'updateSongs']);
