<?php
use App\Controllers\PlaylistController;
use App\Controllers\SongsController;
use App\Controllers\HomeController;

require __DIR__ . '/app.php';
$app->get('/', [HomeController::class, 'index']);
$app->get('/playlist', [PlaylistController::class, 'getAllPlaylists']);
$app->get('/playlist/{id}', [PlaylistController::class, 'getPlaylist']);
$app->post('/playlist', [PlaylistController::class, 'createPlaylist']);
$app->put('/playlist/{id}', [PlaylistController::class, 'updatePlaylist']);
$app->delete('/playlist/{id}', [PlaylistController::class, 'deletePlaylist']);

$app->post('/playlist/{id}/songs', [SongsController::class, 'getAllSongs']);
$app->post('/playlist/{id}/songs', [SongsController::class, 'updateSongs']);
