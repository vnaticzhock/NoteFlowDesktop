import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Page = () => {
    const navigateTo = useNavigate()

    useEffect(() => {
        navigateTo('/login')
    }, [])
    
    return (<></>);
}

export default Page;