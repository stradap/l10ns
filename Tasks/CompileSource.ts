import { exec, execSync } from 'child_process';
import { defaultOptions } from './CommandOptions';

function run(grunt: IGrunt) {
    grunt.registerTask('compile-source', function() {
        const done = this.async();
        const generateDiagnosticsCmd = 'grunt generate-diagnostics';
        console.log(generateDiagnosticsCmd);
        execSync(generateDiagnosticsCmd);
        const compileSource = [
            'Source/Service/Core.ts',
            'Source/Service/DiagnosticMessages.Generated.ts',
            'Source/Service/Program.ts',
            'Source/Service/Scanner.ts',
            'Source/Service/System.ts',
            'Source/Service/Types.ts',
        ].join(' ');
        const options = [
            '--outFile Build/Binaries/L10ns.js',
            '--module amd',
        ].concat(defaultOptions).join(' ');
        const compileCmd = `tsc ${compileSource} ${options}`;
        console.log(compileCmd);
        exec(compileCmd, (err, stdout, stderr) => {
            if (err || stderr) {
                grunt.log.error(stderr || stdout || (err.message + err.stack));
                return;
            }
            console.log(stdout);
            done();
        });
    });
}

module.exports = run;