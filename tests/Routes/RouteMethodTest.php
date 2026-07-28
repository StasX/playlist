<?php

declare(strict_types=1);

namespace Tests\Routes;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\HttpTestCase;

final class RouteMethodTest extends HttpTestCase
{
    /**
     * @return array<string, array{string, string}>
     */
    public static function unsupportedMethods(): array
    {
        return [
            'patch playlist collection' => ['PATCH', '/playlist'],
            'put playlist collection' => ['PUT', '/playlist'],
            'delete playlist collection' => ['DELETE', '/playlist'],
            'patch playlist item' => ['PATCH', '/playlist/1'],
            'put songs collection' => ['PUT', '/playlist/1/songs'],
            'delete songs collection' => ['DELETE', '/playlist/1/songs'],
        ];
    }

    #[DataProvider('unsupportedMethods')]
    public function testUnsupportedMethodReturns405(
        string $method,
        string $path
    ): void {
        $response = $this->request($method, $path);

        self::assertSame(405, $response->getStatusCode());
    }
}
