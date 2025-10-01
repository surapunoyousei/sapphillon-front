use static_files::resource_dir;
use std::path::Path;
use std::process::{Command, Stdio};

fn run_cmd(dir: &Path, cmd: &str, args: &[&str]) -> std::io::Result<()> {
    let status = Command::new(cmd)
        .args(args)
        .current_dir(dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()?;
    if status.success() {
        Ok(())
    } else {
        Err(std::io::Error::other(format!(
            "command {:?} {:?} failed with status: {}",
            cmd, args, status
        )))
    }
}

fn main() -> std::io::Result<()> {
    // Run pnpm install and pnpm build in the repository root (parent of web_server)
    let root = Path::new("..");
    println!("Running `pnpm install` in {:?}", root);
    run_cmd(root, "pnpm", &["install"])?;
    println!("Running `pnpm build` in {:?}", root);
    run_cmd(root, "pnpm", &["build"])?;

    // Continue with existing static files build using the generated `dist` directory
    resource_dir("../dist").build()
}
