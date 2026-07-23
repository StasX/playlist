<?php
use DI\Container;
use Twig\TwigFunction;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;
use Slim\Factory\AppFactory;
use App\Controllers\HomeController;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/database.php';

$container = new Container();
AppFactory::setContainer($container);

// $container->set('view', function () {
//     return Twig::create(__DIR__ . '/../app/Views', [
//         'cache' => false,
//     ]);
// });
$container->set('view', function (): Twig {
    $twig = Twig::create(
        __DIR__ . '/../app/Views',
        [
            'cache' => false,
        ]
    );

    $manifestPath = __DIR__ . '/../public/manifest.json';

    $twig->getEnvironment()->addFunction(
        new TwigFunction(
            'asset',
            function (string $asset) use ($manifestPath): string {
                if (!is_file($manifestPath)) {
                    throw new RuntimeException(
                        'Webpack manifest not found: ' . $manifestPath
                    );
                }

                $manifest = json_decode(
                    file_get_contents($manifestPath),
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );

                if (!isset($manifest[$asset])) {
                    throw new RuntimeException(
                        sprintf(
                            'Asset "%s" was not found in manifest.json.',
                            $asset
                        )
                    );
                }

                return $manifest[$asset];
            }
        )
    );

    return $twig;
});

$container->set(HomeController::class, function ($container) {
    return new HomeController(
        $container->get('view')
    );
});

$app = AppFactory::create();
$app->add(TwigMiddleware::createFromContainer($app));
$app->addRoutingMiddleware();

require __DIR__ . '/logger.php';

$errorMiddleware = $app->addErrorMiddleware(true, true, true, $logger);

require __DIR__ . '/../config/routes.php';

return $app;
