import Image from "next/image";
import AjoForm from "./form.jsx";
import HeaderComponent from "./headerComponent.jsx";

export default function Home() {
  return (
    <main className="relative">
      <HeaderComponent />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* 🔹 Background Video */}
        <div className="absolute inset-0 aspect-video w-full h-full">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/bg-video.mp4" type="video/mp4" />
  </video>
</div>


        {/* 🔹 Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* 🔹 Hero Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
          <div className="mb-10">
            <p className="text-4xl sm:text-5xl font-bold text-gray-100 leading-tight">
              Team up, save up,
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-gray-100 leading-tight">
              and ball out when it’s your turn.
            </p>
            <p className="text-lg mt-4 text-gray-300 max-w-xl mx-auto">
              AJO makes group saving fun and easy.
            </p>
          </div>

          {/* 🔹 Form Section */}
          <div className="w-full max-w-md bg-black/60 backdrop-blur-md rounded-2xl p-6 shadow-lg ">
            <AjoForm />
          </div>
        </div>
      </section>
    </main>
  );
}
