<?php

declare(strict_types=1);

namespace Tests\Routes;

use App\Models\PlaylistModel;
use Tests\HttpTestCase;

final class SongsRoutesTest extends HttpTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        PlaylistModel::query()->delete();
    }

    public function testGetAllSongsReturnsPlaylistSongs(): void
    {
        $songs = [
            [
                'name' => 'Song one',
                'url' => 'https://example.com/song-1.mp3',
            ],
            [
                'name' => 'Song two',
                'url' => 'https://example.com/song-2.mp3',
            ],
        ];

        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode($songs, JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'GET',
            '/playlist/' . $playlist->getKey() . '/songs'
        );

        self::assertSame(200, $response->getStatusCode());
        self::assertSame($songs, $this->json($response));
    }

    public function testGetAllSongsReturns404WhenPlaylistDoesNotExist(): void
    {
        $response = $this->request(
            'GET',
            '/playlist/999999/songs'
        );

        self::assertSame(404, $response->getStatusCode());
    }

    public function testUpdateSongsUpdatesPlaylistSongs(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $songs = [
            [
                'name' => 'New song',
                'url' => 'https://example.com/new-song.mp3',
            ],
        ];

        $response = $this->request(
            'POST',
            '/playlist/' . $playlist->getKey() . '/songs',
            [
                'songs' => $songs,
            ]
        );

        self::assertSame(200, $response->getStatusCode());

        $playlist->refresh();

        self::assertSame(
            $songs,
            json_decode(
                $playlist->songs,
                true,
                512,
                JSON_THROW_ON_ERROR
            )
        );
    }

    public function testUpdateSongsReturns400WhenSongsIsMissing(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'POST',
            '/playlist/' . $playlist->getKey() . '/songs',
            []
        );

        self::assertSame(400, $response->getStatusCode());
    }

    public function testUpdateSongsReturns400WhenSongsIsNotArray(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'POST',
            '/playlist/' . $playlist->getKey() . '/songs',
            [
                'songs' => 'invalid',
            ]
        );

        self::assertSame(400, $response->getStatusCode());
    }

    public function testUpdateSongsReturns400WhenSongNameIsMissing(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'POST',
            '/playlist/' . $playlist->getKey() . '/songs',
            [
                'songs' => [
                    [
                        'url' => 'https://example.com/song.mp3',
                    ],
                ],
            ]
        );

        self::assertSame(400, $response->getStatusCode());
    }

    public function testUpdateSongsReturns400WhenSongUrlIsMissing(): void
    {
        $playlist = PlaylistModel::query()->create([
            'name' => 'Rock',
            'image' => 'https://example.com/rock.jpg',
            'songs' => json_encode([], JSON_THROW_ON_ERROR),
        ]);

        $response = $this->request(
            'POST',
            '/playlist/' . $playlist->getKey() . '/songs',
            [
                'songs' => [
                    [
                        'name' => 'Song without URL',
                    ],
                ],
            ]
        );

        self::assertSame(400, $response->getStatusCode());
    }

    public function testUpdateSongsReturns404WhenPlaylistDoesNotExist(): void
    {
        $response = $this->request(
            'POST',
            '/playlist/999999/songs',
            [
                'songs' => [],
            ]
        );

        self::assertSame(404, $response->getStatusCode());
    }
}
