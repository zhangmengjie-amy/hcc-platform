'use client'; // 启用客户端渲染
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

const HomeRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.push('/home'); // 自动跳转到登录页面
    }, [router]);

    return null;
};

const Page = () => {
    return (
        <HomeRedirect/>
    );
};

export default Page;


