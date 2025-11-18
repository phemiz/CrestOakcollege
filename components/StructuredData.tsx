import React, { useEffect } from 'react';

const StructuredData: React.FC<{ data: object; id: string }> = ({ data, id }) => {
    useEffect(() => {
        const existingScript = document.getElementById(id);
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(data);
        document.head.appendChild(script);

        return () => {
            // Check if the component is still mounted before cleaning up
            const scriptToRemove = document.getElementById(id);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [data, id]);

    return null; // This component doesn't render anything itself
};


export default StructuredData;