import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité - Facebook, Instagram, Twilio, WhatsApp',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Politique de confidentialité</h1>
        <p className="mb-12 text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos données
              personnelles lorsque vous utilisez notre application de messagerie multicanale, incluant les intégrations
              avec Facebook Messenger, Instagram, Twilio (SMS) et WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">2. Données collectées</h2>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Nous collectons les données suivantes pour fournir nos services :
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Informations de compte (email, nom)</li>
              <li>Conversations et messages échangés via les canaux connectés</li>
              <li>Données des Pages Facebook et comptes Instagram connectés</li>
              <li>Numéros de téléphone pour les communications SMS et WhatsApp</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">3. Intégrations tierces</h2>

            <h3 className="mb-2 font-medium">Facebook & Instagram (Meta)</h3>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Lorsque vous connectez vos comptes Facebook et Instagram, nous accédons aux données nécessaires pour
              gérer vos conversations Messenger et messages directs Instagram. Ces données sont régies par la
              politique de confidentialité de Meta. Consultez{' '}
              <a
                href="https://www.facebook.com/privacy/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                la politique de confidentialité de Meta
              </a>
              .
            </p>

            <h3 className="mb-2 font-medium">Twilio (SMS & WhatsApp)</h3>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Les communications SMS et WhatsApp transitent par Twilio. Les numéros de téléphone et le contenu
              des messages sont traités conformément aux conditions de Twilio. Consultez{' '}
              <a
                href="https://www.twilio.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                la politique de confidentialité de Twilio
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">4. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont utilisées exclusivement pour : fournir le service de messagerie, synchroniser
              vos conversations entre canaux, et améliorer l&apos;expérience utilisateur. Nous ne vendons pas vos
              données à des tiers.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">5. Sécurité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout
              accès non autorisé, modification ou divulgation.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">6. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de
              portabilité de vos données. Contactez-nous pour exercer ces droits.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">7. Suppression des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous pouvez demander la suppression de vos données à tout moment. Consultez notre page{' '}
              <Link href="/user-data-deletion" className="text-primary underline">
                Demande de suppression des données
              </Link>{' '}
              pour les instructions détaillées.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique de confidentialité, contactez-nous via les
              paramètres de votre compte.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            href="/terms-of-service"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Voir les Conditions d&apos;utilisation
          </Link>
        </div>
      </div>
    </div>
  )
}
