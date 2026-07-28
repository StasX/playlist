<?php

declare(strict_types=1);

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$finder = Finder::create()
    ->in([
        __DIR__ . '/app',
        __DIR__ . '/bootstrap',
        __DIR__ . '/config',
        __DIR__ . '/public',
    ])
    ->name('*.php')
    ->exclude([
        'storage',
        'vendor',
    ])
    ->notPath([
        'public/index.php',
    ]);

return (new Config())
    ->setRiskyAllowed(true)
    ->setUsingCache(true)
    ->setCacheFile(__DIR__ . '/storage/.php-cs-fixer.cache')
    ->setFinder($finder)
    ->setRules([
        '@PSR12' => true,
        '@PHP83Migration' => true,

        // Arrays
        'array_indentation' => true,
        'trim_array_spaces' => true,
        'no_multiline_whitespace_around_double_arrow' => true,

        // Imports
        'ordered_imports' => [
            'sort_algorithm' => 'alpha',
        ],
        'no_unused_imports' => true,
        'single_import_per_statement' => true,

        // Class / Functions
        'single_trait_insert_per_statement' => true,
        'single_line_empty_body' => true,
        'return_type_declaration' => true,
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
        ],

        // Operators
        'binary_operator_spaces' => [
            'default' => 'single_space',
        ],

        // Strings
        'single_quote' => true,

        // Whitespace
        'blank_line_after_namespace' => true,
        'blank_line_after_opening_tag' => true,
        'no_extra_blank_lines' => true,
        'no_trailing_whitespace' => true,

        // Control structures
        'control_structure_braces' => true,
        'no_useless_else' => true,
        'simplified_if_return' => true,

        // Comments
        'single_line_comment_style' => [
            'comment_types' => ['hash'],
        ],
        'no_empty_comment' => true,

        // Risky
        'strict_comparison' => true,
        'strict_param' => true,
    ]);
