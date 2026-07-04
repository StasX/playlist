<?php
use DI\Container;
use Slim\Views\Twig;
use Slim\Factory\AppFactory;
use App\Controllers\HomeController;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/database.php';

$container = new Container();
AppFactory::setContainer($container);

$container->set(Twig::class, function () {
    return Twig::create(__DIR__ . '/../resources/templates', [
        'cache' => false,
    ]);
});
$container->set(HomeController::class, function ($container) {
    return new HomeController(
        $container->get(Twig::class)
    );
});



require __DIR__ . '/../app/routes.php';
