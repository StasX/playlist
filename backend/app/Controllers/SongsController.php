<?php
namespace App\Controllers;

use App\Models\PlaylistModel as PlaylistModel;
use App\Validation\PlaylistValidator;
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
        $payload = json_decode((string) $request->getBody());
        if (! $payload instanceof \stdClass || ! isset($payload->songs) ||
            ! PlaylistValidator::validSongs($payload->songs) || $payload->songs === []
        ) {
            return $response->withStatus(400);
        }
        $data = get_object_vars($payload);
        $playlist = PlaylistModel::find($args['id']);
        if (! $playlist) {
            return $response->withStatus(404);
        }
        $playlist->songs = json_encode($data['songs']);
        $playlist->save();
        return $response->withStatus(200);
    }
}
