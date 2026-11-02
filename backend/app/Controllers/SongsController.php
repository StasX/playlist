<?php

namespace App\Controllers;

use App\Models\PlaylistModel as PlaylistModel;
use App\Validation\PlaylistValidator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SongsController
{
    /** @param array{id: string} $args */
    public function getAllSongs(Request $request, Response $response, array $args): Response
    {
        $playlist = PlaylistModel::query()->find($args['id']);
        if ($playlist === null) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(json_encode([
            'songs' => json_decode($playlist->songs, true, 512, JSON_THROW_ON_ERROR),
        ], JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /** @param array{id: string} $args */
    public function updateSongs(Request $request, Response $response, array $args): Response
    {
        $payload = json_decode((string) $request->getBody());
        if (
            ! $payload instanceof \stdClass || ! isset($payload->songs) ||
            ! PlaylistValidator::validSongs($payload->songs) || $payload->songs === []
        ) {
            return $response->withStatus(400);
        }
        $data = get_object_vars($payload);
        $playlist = PlaylistModel::query()->find($args['id']);
        if ($playlist === null) {
            return $response->withStatus(404);
        }
        $playlist->songs = json_encode($data['songs'], JSON_THROW_ON_ERROR);
        $playlist->save();
        return $response->withStatus(200);
    }
}
