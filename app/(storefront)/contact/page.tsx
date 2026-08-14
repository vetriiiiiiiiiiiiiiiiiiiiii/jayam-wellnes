export const metadata = {
  title: 'Contact Us | Miracle Tree',
  description: 'Get in touch with Miracle Tree Life Science.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-pearl pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-10 md:p-16 rounded-3xl border border-brand-green-100 shadow-sm mt-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4 tracking-tighter">
            Get in Touch
          </h1>
          <p className="text-brand-dark/70 font-light">
            We'd love to hear from you. Please fill out this form and we will get back to you shortly.
          </p>
        </header>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-brand-dark">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-4 py-3 rounded-lg border border-brand-green-200 focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-brand-dark">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 rounded-lg border border-brand-green-200 focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-brand-dark">Subject</label>
            <input 
              type="text" 
              id="subject" 
              className="w-full px-4 py-3 rounded-lg border border-brand-green-200 focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 outline-none transition-all"
              placeholder="How can we help?"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-brand-dark">Message</label>
            <textarea 
              id="message" 
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-brand-green-200 focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 outline-none transition-all resize-none"
              placeholder="Your message here..."
            />
          </div>

          <button 
            type="button" 
            className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium tracking-wide hover:bg-brand-green-900 transition-colors duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}
