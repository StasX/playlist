<?php

declare(strict_types=1);

namespace Tests\Routes;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\HttpTestCase;

final class ErrorDetailsTest extends HttpTestCase
{
    public static function environments(): iterable
    {
        yield 'unset' => [null, false];
        yield 'production' => ['production', false];
        yield 'testing' => ['testing', false];
        yield 'unknown' => ['unknown', false];
        yield 'development' => ['development', true];
    }

    #[DataProvider('environments')]
    public function testExceptionDetailsAreOnlyVisibleInDevelopment(?string $environment, bool $visible): void
    {
        $previous = getenv('APP_ENV');
        try {
            putenv($environment === null ? 'APP_ENV' : 'APP_ENV=' . $environment);
            $this->app = require dirname(__DIR__, 2) . '/bootstrap/config.php';
            $this->app->get('/api/test-error', function (): never {
                throw new \RuntimeException('Sensitive database password and internal path');
            });

            $response = $this->request('GET', '/test-error');
            self::assertSame(500, $response->getStatusCode());
            $body = (string) $response->getBody();
            if ($visible) {
                self::assertStringContainsString('Sensitive database password and internal path', $body);
            } else {
                self::assertStringNotContainsString('Sensitive database password and internal path', $body);
                self::assertStringNotContainsString('ErrorDetailsTest.php', $body);
                self::assertStringNotContainsString('RuntimeException', $body);
            }
        } finally {
            putenv($previous === false ? 'APP_ENV' : 'APP_ENV=' . $previous);
        }
    }
}
