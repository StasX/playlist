<?php
use DI\Container;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;
use Slim\Factory\AppFactory;
use App\Controllers\HomeController;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/database.php';

$container = new Container();
AppFactory::setContainer($container);

$container->set('view', function () {
    return Twig::create(__DIR__ . '/../resources/templates', [
        'cache' => false,
    ]);
});
$container->set(HomeController::class, function ($container) {
    return new HomeController(
        $container->get('view')
    );
});

$app = AppFactory::create();
$app->add(TwigMiddleware::createFromContainer($app));
$app->addRoutingMiddleware();

require __DIR__ . '/../app/logger.php';

$errorMiddleware = $app->addErrorMiddleware(true, true, true, $logger);

require __DIR__ . '/../app/routes.php';

return $app;
