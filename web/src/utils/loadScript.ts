export default function loadScript(url: string) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = url;
        script.async = true;

        script.onload = (e) => {
            resolve(e);

            document.head.removeChild(script);
        };

        script.onerror = (...arg) => {
            reject(arg);
        };

        document.head.appendChild(script);
    });
}
