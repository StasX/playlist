<?php

declare(strict_types=1);

namespace Tests\Routes;

use App\Models\PlaylistModel;
use Tests\HttpTestCase;

final class PlaylistRoutesTest extends HttpTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        PlaylistModel::query()->delete();
    }

    public function testGetAllPlaylistsReturnsEmptyArray(): void
    {
        $response = $this->request('GET', '/playlist');

        self::assertSame(200, $response->getStatusCode());
        self::assertStringStartsWith(
            'application/json',
            $response->getHeaderLine('Content-Type')
        );

        self::assertSame([], $this->json($response));
    }

    public function testGetAllPlaylistsReturnsPlaylists(): void
    {
        PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        PlaylistModel::query()->create([
            'name' => 'Jazz',
            'image' => 'https://example.com/jazz.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request('GET', '/playlist');
        $body = $this->json($response);

        self::assertSame(200, $response->getStatusCode());
        self::assertCount(2, $body);

        self::assertSame('Rock', $body[0]['name']);
        self::assertSame('Jazz', $body[1]['name']);
    }

    public function testGetPlaylistReturnsRequestedPlaylist(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'GET',
            '/playlist/' . $playlist->getKey()
        );

        $body = $this->json($response);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame($playlist->getKey(), $body['id']);
        self::assertSame('Rock', $body['name']);
        self::assertSame('https://example.com/rock.jpg', $body['image']);
    }

    public function testGetPlaylistReturns404WhenPlaylistDoesNotExist(): void
    {
        $response = $this->request('GET', '/playlist/999999');

        self::assertSame(404, $response->getStatusCode());
    }

    public function testCreatePlaylistCreatesPlaylist(): void
    {
        $payload = [
            'name' => 'Workout',
            'image' => 'https://example.com/workout.jpg',
            'songs' => [
                [
                    'name' => 'First song',
                    'url' => 'https://example.com/song-1.mp3',
                ],
            ],
        ];

        $response = $this->request('POST', '/playlist', $payload);
        $body = $this->json($response);

        self::assertSame(201, $response->getStatusCode());
        self::assertArrayHasKey('id', $body);
        self::assertSame('Workout', $body['name']);
        self::assertSame($payload['image'], $body['image']);

        $playlist = PlaylistModel::query()->find($body['id']);

        self::assertNotNull($playlist);
        self::assertSame('Workout', $playlist->name);
    }

    public function testCreatePlaylistReturns400WhenNameIsMissing(): void
    {
        $response = $this->request('POST', '/playlist', [
            'image' => 'https://example.com/image.jpg',
            'songs' => [],
        ]);

        self::assertSame(400, $response->getStatusCode());
    }

    public function testCreatePlaylistReturns400WhenImageIsMissing(): void
    {
        $response = $this->request('POST', '/playlist', [
            'name' => 'Rock',
            'songs' => [],
        ]);

        self::assertSame(400, $response->getStatusCode());
    }

    public function testCreatePlaylistReturns400WhenSongsIsNotArray(): void
    {
        $response = $this->request('POST', '/playlist', [
            'name' => 'Rock',
            'image' => 'https://example.com/image.jpg',
            'songs' => 'invalid',
        ]);

        self::assertSame(400, $response->getStatusCode());
    }

    public function testUpdatePlaylistUpdatesExistingPlaylist(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Old name',
            'image' => 'https://example.com/old.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'PUT',
            '/playlist/' . $playlist->getKey(),
            [
                'name' => 'New name',
                'image' => 'https://example.com/new.jpg',
                'songs' => [],
            ]
        );

        self::assertSame(200, $response->getStatusCode());

        $playlist->refresh();

        self::assertSame('New name', $playlist->name);
        self::assertSame('https://example.com/new.jpg', $playlist->image);
    }

    public function testUpdatePlaylistReturns404WhenPlaylistDoesNotExist(): void
    {
        $response = $this->request('PUT', '/playlist/999999', [
            'name' => 'New name',
            'image' => 'https://example.com/new.jpg',
            'songs' => [],
        ]);

        self::assertSame(404, $response->getStatusCode());
    }

    public function testDeletePlaylistDeletesExistingPlaylist(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Delete me',
            'image' => 'https://example.com/delete.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $id = $playlist->getKey();

        $response = $this->request('DELETE', '/playlist/' . $id);

        self::assertSame(204, $response->getStatusCode());
        self::assertNull(PlaylistModel::query()->find($id));
    }

    public function testDeletePlaylistReturns404WhenPlaylistDoesNotExist(): void
    {
        $response = $this->request('DELETE', '/playlist/999999');

        self::assertSame(404, $response->getStatusCode());
    }
}
