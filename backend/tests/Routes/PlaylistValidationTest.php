<?php

declare(strict_types=1);

namespace Tests\Routes;

use App\Validation\PlaylistValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\StreamFactory;
use Tests\HttpTestCase;

final class PlaylistValidationTest extends HttpTestCase
{
    public static function invalidPayloads(): iterable
    {
        $valid = ['name' => 'Rock', 'image' => 'https://example.com/rock.jpg', 'songs' => []];
        $invalidFields = [
            ['name' => null], ['name' => 123], ['name' => []], ['name' => '  '],
            ['name' => str_repeat('a', 101)],
            ['image' => null], ['image' => true], ['image' => []], ['image' => ''],
            ['image' => 'invalid'], ['image' => 'javascript:alert(1)'],
            ['image' => 'https://example.com/' . str_repeat('a', 1000)],
            ['songs' => null], ['songs' => 'invalid'], ['songs' => (object) []],
            ['songs' => ['key' => ['name' => 'Song', 'url' => 'https://example.com/a.mp3']]],
            ['songs' => ['invalid']], ['songs' => [[]]],
            ['songs' => [['name' => 1, 'url' => 'https://example.com/a.mp3']]],
            ['songs' => [['name' => ' ', 'url' => 'https://example.com/a.mp3']]],
            ['songs' => [['name' => 'Song', 'url' => null]]],
            ['songs' => [['name' => 'Song', 'url' => 'file:///tmp/song.mp3']]],
            ['songs' => [['name' => str_repeat('a', 65536), 'url' => 'https://example.com/a.mp3']]],
        ];
        foreach (['POST', 'PUT'] as $method) {
            foreach ($invalidFields as $index => $fields) {
                yield $method . ' invalid field ' . $index => [
                    $method, json_encode(array_replace($valid, $fields), JSON_THROW_ON_ERROR),
                ];
            }
            foreach (['{', 'null', '42', '[]', '{}', '{"unknown":true}'] as $body) {
                yield $method . ' invalid body ' . $body => [$method, $body];
            }
        }
        foreach (array_keys($valid) as $field) {
            $payload = $valid;
            unset($payload[$field]);
            yield 'missing ' . $field => ['POST', json_encode($payload, JSON_THROW_ON_ERROR)];
        }
    }

    #[DataProvider('invalidPayloads')]
    public function testInvalidPayloadReturns400BeforeDatabaseAccess(string $method, string $body): void
    {
        $path = $method === 'POST' ? '/api/playlist' : '/api/playlist/999999';
        $request = (new ServerRequestFactory())->createServerRequest($method, $path)
            ->withHeader('Content-Type', 'application/json')
            ->withBody((new StreamFactory())->createStream($body));

        self::assertSame(400, $this->app->handle($request)->getStatusCode());
    }

    public function testValidPayloadsAllowEmptySongsAndPartialUpdates(): void
    {
        self::assertTrue(PlaylistValidator::validPlaylist([
            'name' => 'Rock', 'image' => 'https://example.com/rock.jpg', 'songs' => [],
        ]));
        self::assertTrue(PlaylistValidator::validPlaylist(['name' => 'New name'], true));
        self::assertTrue(PlaylistValidator::validPlaylist(['songs' => []], true));
        self::assertTrue(PlaylistValidator::validSongs([
            (object) ['name' => 'Song', 'url' => 'https://example.com/song.mp3'],
        ]));
    }
}
