<?php
namespace App\Controllers;

use App\Models\PlaylistModel as PlaylistModel;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SongsController
{
    public function getAllSongs(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::select('songs')->find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode(['songs' => json_decode($playlist->songs, true)]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateSongs(Request $request, Response $response, array $args): Response
    {
        $data = json_decode((string) $request->getBody(), true);
        if (! is_array($data) || ! isset($data['songs']) ||
            ! is_array($data['songs']) || ! array_is_list($data['songs']) ||
            $data['songs'] === []
        ) {
            return $response->withStatus(400);
        }
        foreach ($data['songs'] as $song) {
            if (! is_array($song) || ! isset($song['name'], $song['url']) ||
                ! is_string($song['name']) || ! is_string($song['url'])
            ) {
                return $response->withStatus(400);
            }
        }
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $playlist->songs = json_encode($data['songs']);
        $playlist->save();
        return $response->withStatus(200);
    }
}
